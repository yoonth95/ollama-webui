import asyncio
import json
from datetime import datetime
from fastapi import APIRouter, Depends, Request, Body
from fastapi.responses import JSONResponse
from sse_starlette.sse import EventSourceResponse
from sqlalchemy.orm import Session
from app.services.chat import ChatService
from app.utils.response import create_response
from app.utils.handle_exceptions import handle_exceptions
from app.db.database import get_db
from app.core.config import settings
from app.utils.memory_pubsub import memory_pubsub
from app.schemas.chat import ChatUserMessageType, ChatRetryRequestType, ChatCancelRequestType, ChatForceStopRequestType
import logging

router = APIRouter()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 인메모리 PubSub 클라이언트
pubsub_client = memory_pubsub

# SSE 연결 제한 시간 (초)
SSE_TIMEOUT = 60 * 30  # 30분

@router.get("/chat/{room_id}")
@handle_exceptions
async def get_chatting_history(room_id: str, db: Session = Depends(get_db)):
  """채팅방 조회"""
  logger.info(f"📩 클라이언트 채팅방 조회: {room_id}")
  
  response = await ChatService.get_chatting_history(db, room_id)

  if not response:
    return JSONResponse(content=create_response(False, "존재하지 않는 채팅방입니다.", None), status_code=404)

  return JSONResponse(content=create_response(True, "채팅 내역 조회", response), status_code=200)

@router.post("/chat/message/{room_id}")
@handle_exceptions
async def send_message(room_id: str, message: dict = Body(...), db: Session = Depends(get_db)):
  """기존 채팅방에 메시지 전송"""
  logger.info(f"📩 클라이언트 메시지 전송: {room_id}")
  
  # 채팅방 존재 여부 확인
  chat_history = await ChatService.get_chatting_history(db, room_id)
  if not chat_history:
    return JSONResponse(content=create_response(False, "존재하지 않는 채팅방입니다.", None), status_code=404)
  
  try:
    # 트랜잭션 시작
    db.begin()
    
    # 메시지 유효성 검사
    if not message.get("content") and not message.get("images"):
      return JSONResponse(content=create_response(False, "이미지 첨부 또는 질문을 입력해주세요.", None), status_code=400)
    
    if not message.get("model"):
      return JSONResponse(content=create_response(False, "모델을 선택해주세요.", None), status_code=400)
    
    # 유저 메시지 생성
    user_message = ChatUserMessageType(
      room_id=room_id,
      content=message.get("content", ""),
      model=message.get("model"),
      images=message.get("images")
    )
    
    # 유저 메시지 저장
    await ChatService.save_user_message(db, user_message)
    
    # ollama 요청 구성
    ollama_request = {
      "model": message.get("model"),
      "messages": [
        {
          "role": "user",
          "content": message.get("content", "")
        }
      ]
    }
    
    # 이미지 추가
    if message.get("images"):
      ollama_request["messages"][0]["images"] = message.get("images")
    
    # 이전 대화 기록도 포함 (컨텍스트 제공)
    # 최근 5턴의 대화만 포함
    chat_context = []
    for i, msg in enumerate(chat_history):
      if i >= max(0, len(chat_history) - 10):  # 최대 10개 메시지
        chat_context.append({
          "role": msg["role"],
          "content": msg["content"]
        })
    
    if chat_context:
      # 컨텍스트 추가 (마지막 메시지는 제외하고 앞에 추가)
      ollama_request["messages"] = chat_context + ollama_request["messages"]
    
    # 커밋
    db.commit()
    
    # 비동기로 Ollama 요청 실행
    asyncio.create_task(ChatService.generate_ollama_answer(room_id, ollama_request))
    
    return JSONResponse(content=create_response(True, "메시지 전송 완료", {"room_id": room_id}), status_code=200)
    
  except Exception as e:
    # 롤백
    db.rollback()
    logger.error(f"메시지 전송 중 오류 발생: {e}")
    return JSONResponse(
      content=create_response(False, f"메시지 전송 중 오류가 발생했습니다: {str(e)}", None), 
      status_code=500
    )

@router.get("/chat/stream/{room_id}")
async def stream_chat(room_id: str, request: Request):
  """채팅 스트리밍 응답"""
  logger.info(f"📩 클라이언트 SSE 연결: {room_id}")
  
  async def event_generator():
    # PubSub 인터페이스 생성
    client = pubsub_client.pubsub()
    connection_time = datetime.now()
    
    # 메타데이터 조회를 위한 변수
    model_name = None
    created_at = None
    last_activity = datetime.now().timestamp()
    last_ping_time = datetime.now().timestamp()
    
    try:
      # chat:{room_id} 채널 구독
      client.subscribe(f"chat:{room_id}")
      
      # 초기 연결 알림 메시지 전송
      yield {
        "event": "connected",
        "id": "connection-init",
        "data": json.dumps({"status": "connected", "room_id": room_id})
      }
      
      # 이미 저장된 답변이 있는지 확인
      saved_answer = pubsub_client.get(f"answer:{room_id}")
      
      # 메타데이터 가져오기 (모델명, 생성 시간)
      metadata = pubsub_client.get(f"metadata:{room_id}")
      if metadata:
        try:
          metadata_dict = json.loads(metadata.decode('utf-8') if isinstance(metadata, bytes) else metadata)
          model_name = metadata_dict.get("model")
          created_at = metadata_dict.get("created_at")
        except Exception as e:
          logger.warning(f"메타데이터 파싱 오류: {e}")
      
      if saved_answer:
        # 이미 저장된 답변이 있으면 클라이언트에 전송
        saved_text = saved_answer.decode('utf-8') if isinstance(saved_answer, bytes) else saved_answer
        response_data = {
          "full": saved_text, 
          "init": True,
          "model": model_name,
          "created_at": created_at or datetime.now().isoformat()
        }
        
        last_activity = datetime.now().timestamp()
        
        yield {
          "event": "message",
          "id": "init",
          "data": json.dumps(response_data)
        }
      
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
          
        # 클라이언트 연결 종료 확인
        if await request.is_disconnected():
          logger.info(f"📤 클라이언트 연결 종료: {room_id}")
          # 응답 생성 중단 처리 (클라이언트가 연결을 종료한 경우)
          asyncio.create_task(ChatService.cancel_chat(room_id))
          break
        
        # 주기적으로 ping 메시지 전송 (15초마다)
        now = datetime.now().timestamp()
        if now - last_ping_time > 15:
          last_ping_time = now
          yield {
            "event": "ping",
            "data": json.dumps({"time": now})
          }
          
        # 비동기적으로 메시지 가져오기 (타임아웃 0.1초)
        message = await client.get_message(ignore_subscribe_messages=True, timeout=0.1)
        
        # 메타데이터 업데이트 확인
        if not model_name or not created_at:
          metadata = pubsub_client.get(f"metadata:{room_id}")
          if metadata:
            try:
              metadata_dict = json.loads(metadata.decode('utf-8') if isinstance(metadata, bytes) else metadata)
              model_name = metadata_dict.get("model")
              created_at = metadata_dict.get("created_at")
            except Exception as e:
              logger.warning(f"메타데이터 파싱 오류: {e}")
        
        if message and message["type"] == "message":
          # 활동 시간 업데이트
          last_activity = datetime.now().timestamp()
          
          data = message["data"].decode("utf-8") if isinstance(message["data"], bytes) else message["data"]
          
          # 메시지 데이터 파싱 시도
          try:
            message_data = json.loads(data)
            
            # 오류 메시지 처리
            if message_data.get("error"):
              logger.error(f"스트리밍 오류 메시지: {message_data}")
              yield {
                "event": "error",
                "data": data
              }
              # 에러 발생 시 잠시 대기 후 연결 계속 유지
              await asyncio.sleep(1)
              continue
            
            # 취소 메시지 처리
            if message_data.get("cancelled"):
              logger.info(f"스트리밍 취소 메시지: {room_id}")
              
              # 강제 취소인지 확인
              force_stopped = message_data.get("force_stopped", False)
              if force_stopped:
                logger.info(f"강제 취소로 인해 답변이 저장되지 않음")
                yield {
                  "event": "force_stopped",
                  "data": data
                }
                # 강제 취소 메시지 발생 시 연결 즉시 종료
                return
              
              # 일반 취소 - 부분 저장 여부 확인하여 클라이언트에게 전달
              was_saved = message_data.get("partial_saved", False)
              if was_saved:
                logger.info(f"부분 생성된 답변 저장됨 ({message_data.get('partial_length', 0)} 자)")
              else:
                reason = ""
                # 저장 실패 이유 확인 (태그 처리 등)
                if "사고 과정" in message_data.get("message", ""):
                  reason = " - 불완전한 <think> 태그 감지"
                logger.info(f"부분 생성된 답변 저장되지 않음{reason}")
              
              yield {
                "event": "cancelled",
                "data": data
              }
              
              # 취소 메시지 발생 시 연결 즉시 종료
              return
            
            # 완료 메시지 확인
            if message_data.get("done"):
              logger.info(f"스트리밍 응답 완료: {room_id}")
            
            # 메타데이터 추가
            message_data["model"] = model_name
            message_data["created_at"] = created_at or datetime.now().isoformat()
            data = json.dumps(message_data)
            
            yield {
              "event": "message",
              "id": room_id,
              "data": data
            }
          except json.JSONDecodeError as e:
            logger.error(f"메시지 데이터 파싱 오류: {e}")
            yield {
              "event": "error",
              "data": json.dumps({"error": True, "message": "메시지 데이터 처리 중 오류가 발생했습니다."})
            }
        
        # 장시간 활동이 없을 경우 (5분) 연결 종료
        if datetime.now().timestamp() - last_activity > 300:
          logger.info(f"SSE 연결 비활성 종료: {room_id}")
          yield {
            "event": "inactive",
            "data": json.dumps({"inactive": True, "message": "장시간 활동이 없어 연결이 종료되었습니다."})
          }
          break
        
        # 짧은 대기 시간 후 다시 확인
        await asyncio.sleep(0.01)
    except Exception as e:
      logger.error(f"🚨 스트리밍 오류: {e}")
      yield {
        "event": "error",
        "data": json.dumps({"error": True, "message": str(e)})
      }
    finally:
      # 연결 종료 시 정리
      try:
        client.unsubscribe(f"chat:{room_id}")
        client.close()
      except Exception as e:
        logger.warning(f"연결 종료 중 오류: {e}")
      logger.info(f"📤 SSE 연결 종료: {room_id}")
  
  return EventSourceResponse(event_generator())

@router.post("/chat/cancel")
@handle_exceptions
async def cancel_chat(request: ChatCancelRequestType):
  """채팅 응답 생성 중단"""
  room_id = request.room_id
  logger.info(f"📩 클라이언트 채팅 중단 요청: {room_id}")
  
  # 채팅 응답 생성 중단 서비스 호출
  await ChatService.cancel_chat(room_id)
  
  return JSONResponse(content=create_response(True, "채팅 중단 완료", None), status_code=200)

@router.post("/chat/force-stop")
@handle_exceptions
async def force_stop_chat(request: ChatForceStopRequestType):
  """채팅 응답 강제 중단 (답변 저장하지 않음)"""
  room_id = request.room_id
  logger.info(f"📩 클라이언트 채팅 강제 중단 요청: {room_id}")
  
  # 채팅 응답 강제 중단 서비스 호출
  await ChatService.force_stop_chat(room_id)
  
  return JSONResponse(content=create_response(True, "채팅 강제 중단 완료", None), status_code=200)

@router.post("/chat/retry")
@handle_exceptions
async def retry_chat(request: ChatRetryRequestType, db: Session = Depends(get_db)):
  """재시도 요청"""
  room_id = request.room_id
  logger.info(f"📩 클라이언트 재시도 요청: {room_id}")
  
  # 기존 채팅 내역 가져오기
  chat_history = await ChatService.get_chatting_history(db, room_id)
  if not chat_history:
    return JSONResponse(content=create_response(False, "존재하지 않는 채팅방입니다.", None), status_code=404)
  
  # 유저 메시지만 필터링
  user_messages = [msg for msg in chat_history if msg["role"] == "user"]
  if not user_messages:
    return JSONResponse(content=create_response(False, "재시도할 메시지가 없습니다.", None), status_code=400)
  
  # 마지막 유저 메시지 가져오기
  last_user_message = user_messages[-1]
  
  # 어시스턴트 메시지 체크
  assistant_messages = [msg for msg in chat_history if msg["role"] == "assistant"]
  
  # 인메모리 데이터 초기화
  pubsub_client.delete(f"answer:{room_id}")
  
  # 채널의 기존 메시지 정리
  pubsub_client.clear_channel(f"chat:{room_id}")
  
  # 올라마 요청 재구성
  ollama_request = {
    "model": last_user_message["model"],
    "messages": [
      {
        "role": "user",
        "content": last_user_message["content"]
      }
    ]
  }
  
  # 이미지가 있으면 추가
  if "images" in last_user_message and last_user_message["images"]:
    ollama_request["messages"][0]["images"] = last_user_message["images"]
  
  # 이전 대화 기록도 포함 (컨텍스트 제공)
  chat_context = []
  for i, msg in enumerate(chat_history[:-1]):  # 마지막 메시지 제외
    if i >= len(chat_history) - 10:  # 최대 5턴(10개 메시지)만 포함
      chat_context.append({
        "role": msg["role"],
        "content": msg["content"]
      })
  
  if chat_context:
    # 컨텍스트 추가
    ollama_request["messages"] = chat_context + ollama_request["messages"]
  
  # 어시스턴트 메시지가 이미 있으면, DB에서 삭제
  if assistant_messages and len(assistant_messages) > 0:
    last_assistant_message = assistant_messages[-1]
    print(last_assistant_message)
    # DB에서 답변 메시지 삭제
    # await ChatService.delete_assistant_message(db, last_assistant_message["id"])
  
  # 비동기로 새 Ollama 요청 실행
  # asyncio.create_task(ChatService.generate_ollama_answer(room_id, ollama_request))
  
  return JSONResponse(content=create_response(True, "재시도 요청 완료", None), status_code=200)