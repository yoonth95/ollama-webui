from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sse_starlette.sse import EventSourceResponse
from datetime import datetime
from app.services.room import RoomService, ROOM_TITLE_KEY_PREFIX, ROOM_CHANNEL_PREFIX
from app.services.chat import ChatService
from app.schemas.room import RoomCreateRequest, RoomRenameRequest
from app.schemas.chat import ChatUserMessageType
from app.utils.response import create_response
from app.utils.handle_exceptions import handle_exceptions
from app.db.database import get_db
from app.utils.memory_pubsub import memory_pubsub
import asyncio
import json
import logging
import random

router = APIRouter()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 인메모리 PubSub 클라이언트
pubsub_client = memory_pubsub

# SSE 연결 제한 시간 (초)
SSE_TIMEOUT = 60 * 30  # 30분

@router.post("/room/create-room")
@handle_exceptions
async def create_new_room(request: RoomCreateRequest, db: Session = Depends(get_db)):
  """채팅방 생성"""
  logger.info(f"📩 클라이언트 채팅방 생성")
  
  if not request.content and not request.images:
    return JSONResponse(content=create_response(False, "이미지 첨부 또는 질문을 입력해주세요.", None), status_code=400)

  if not request.model:
    return JSONResponse(content=create_response(False, "모델을 선택해주세요.", None), status_code=400)
  
  try:
    db.begin()  # 트랜잭션 시작
    
    response = await RoomService.create_room_service(db, commit=False)
    if not response:
      db.rollback()
      logger.error("채팅방 생성 실패: 빈 응답")
      return JSONResponse(content=create_response(False, "채팅방 생성 실패", None), status_code=500)
    
    user_message = {
      "room_id": response["id"],
      "content": request.content,
      "model": request.model,
    }
    ollama_request = {
      "model": request.model,
      "messages": [
        { "role": "user", "content": request.content }
      ]
    }
    if request.images:
      user_message["images"] = request.images
      ollama_request["messages"][0]["images"] = request.images
    
    # 유저 메시지 저장 (commit=False로 설정하여 자동 커밋 방지)
    user_response_data = await ChatService.save_user_message(db, ChatUserMessageType(**user_message), commit=False)
    
    # 필요한 데이터 추출 후 커밋
    user_message_id = user_response_data["id"]
    db.commit() # 모든 작업이 성공적으로 완료된 후 커밋
    
    # 답변 생성
    asyncio.create_task(ChatService.generate_ollama_answer(response["id"], ollama_request, user_message_id))

    # 타이틀 생성
    asyncio.create_task(RoomService.generate_and_update_title(response["id"], request.content, request.model))

    # await asyncio.sleep(3)
    return JSONResponse(content=create_response(True, "채팅방 생성 완료", response), status_code=200)
  
  except Exception as e:
    db.rollback()
    logger.error(f"채팅방 생성 중 오류 발생: {e}")
    raise # 예외를 다시 발생시켜 handle_exceptions에서 에러 처리

@router.get("/room/get-rooms")
@handle_exceptions
async def get_rooms(page: int = 1, limit: int = 20, db: Session = Depends(get_db)):
  """채팅방 전체 조회"""
  logger.info(f"📩 클라이언트 채팅방 리스트 조회")
  response = await RoomService.get_rooms_service(db, page, limit)

  return JSONResponse(content=create_response(True, "채팅방 전체 조회", response), status_code=200)

@router.delete("/room/delete-room/")
@handle_exceptions
async def delete_room_no_id():
  """채팅방 ID 넘겨주지 않는 경우"""
  return JSONResponse(content=create_response(False, "채팅방을 찾을 수 없습니다.", None), status_code=404)

@router.delete("/room/delete-room/{room_id}")
@handle_exceptions
async def delete_room(room_id: str, db: Session = Depends(get_db)):
  """채팅방 삭제"""
  logger.info(f"📩 클라이언트 채팅방 삭제")
  
  success = await RoomService.delete_room_service(db, room_id)
  
  if not success:
    return JSONResponse(content=create_response(False, "채팅방을 찾을 수 없습니다.", None), status_code=404)

  return JSONResponse(content=create_response(True, "채팅방 삭제 성공", None), status_code=200)

@router.patch("/room/update-room-title")
@handle_exceptions
async def update_room_title(request: RoomRenameRequest, db: Session = Depends(get_db)):
  """채팅방 이름 변경"""
  logger.info(f"📩 클라이언트 채팅방 이름 변경")
  
  room_id = request.room_id
  new_title = request.new_title
  success = await RoomService.update_room_title_service(db, room_id, new_title)
  
  if not success:
    return JSONResponse(content=create_response(False, "채팅방을 찾을 수 없습니다.", None), status_code=404)

  return JSONResponse(content=create_response(True, "채팅방 이름 변경 성공", None), status_code=200)

@router.get("/room/stream-title/{room_id}")
async def stream_room_title(room_id: str, request: Request):
  """채팅방 제목 스트리밍"""
  logger.info(f"📩 클라이언트 채팅방 제목 SSE 연결: {room_id}")
  
  async def event_generator():
    # PubSub 인터페이스 생성
    client = pubsub_client.pubsub()
    connection_time = datetime.now()
    last_activity = datetime.now().timestamp()
    last_ping_time = datetime.now().timestamp()
    
    try:
      # room:{room_id} 채널 구독
      client.subscribe(f"{ROOM_CHANNEL_PREFIX}{room_id}")
      
      # 초기 연결 알림 메시지 전송
      yield {
        "event": "connected",
        "id": "connection-init",
        "data": json.dumps({"status": "connected", "room_id": room_id})
      }
      
      # 이미 저장된 제목이 있는지 확인
      saved_title = pubsub_client.get(f"{ROOM_TITLE_KEY_PREFIX}{room_id}")
      
      if saved_title:
        # 이미 저장된 제목이 있으면 클라이언트에 전송
        saved_data = saved_title.decode('utf-8') if isinstance(saved_title, bytes) else saved_title
        try:
          title_data = json.loads(saved_data)
          response_data = {
            "full": title_data.get("title", "새 채팅"),
            "init": True,
            "updated_at": title_data.get("updated_at", datetime.now().isoformat()),
          }
          
          last_activity = datetime.now().timestamp()
          
          yield {
            "event": "title",
            "id": "init",
            "data": json.dumps(response_data)
          }
        except json.JSONDecodeError:
          logger.warning(f"채팅방 제목 데이터 파싱 오류: {saved_data}")
      
      # 실시간 메시지 구독
      while True:
        # 연결 시간 제한 확인 (30분)
        if (datetime.now() - connection_time).total_seconds() > SSE_TIMEOUT:
          logger.info(f"SSE 연결 제한 시간 초과: {room_id}")
          yield {
            "event": "timeout",
            "data": json.dumps({"timeout": True, "message": "연결 제한 시간이 초과되었습니다."})
          }
          break
          
        # 클라이언트 연결 끊김 확인
        if await request.is_disconnected():
          logger.info(f"SSE 클라이언트 연결 끊김: {room_id}")
          break
        
        # 15초마다 핑 메시지 전송
        now = datetime.now().timestamp()
        if now - last_ping_time > 15:
          last_ping_time = now
          yield {
            "event": "ping",
            "data": json.dumps({"time": now})
          }
        
        # PubSub 메시지 검사
        message = client.get_message(timeout=1.0)
        if message and message["type"] == "message":
          try:
            # 간혼 방지를 위해 바이트 문자열을 문자열로 변환
            data = message["data"].decode('utf-8') if isinstance(message["data"], bytes) else message["data"]
            message_data = json.loads(data)
            
            # 제목 갱신 이벤트만 처리
            if message_data.get("event") == "title_updated":
              event_data = message_data.get("data", {})
              response_data = {
                "title": event_data.get("title", "새 채팅"),
                "updated_at": datetime.now().isoformat()
              }
              
              last_activity = datetime.now().timestamp()
              
              yield {
                "event": "title",
                "data": json.dumps(response_data)
              }
          except json.JSONDecodeError:
            logger.warning(f"JSON 데이터 파싱 오류: {message}")
          except Exception as e:
            logger.error(f"SSE 이벤트 처리 중 오류: {e}")
        
        # 5분 동안 업데이트가 없으면 연결 유지를 위한 메시지 발송
        if current_time - last_activity > 300:  # 5분
          yield {
            "event": "keepalive",
            "data": json.dumps({"time": current_time})
          }
          last_activity = current_time
        
        await asyncio.sleep(0.5)  # CPU 과부하 방지
    except Exception as e:
      logger.error(f"SSE 이벤트 스트림 오류: {e}")
      yield {
        "event": "error",
        "data": json.dumps({"error": str(e)})
      }
    finally:
      # PubSub 구독 취소
      try:
        client.unsubscribe(f"{ROOM_CHANNEL_PREFIX}{room_id}")
        client.close()
      except Exception as e:
        logger.error(f"PubSub 구독 취소 오류: {e}")
  
  return EventSourceResponse(event_generator())