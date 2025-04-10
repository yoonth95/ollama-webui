import asyncio
import json
from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from sse_starlette.sse import EventSourceResponse
from sqlalchemy.orm import Session
from app.services.chat import ChatService
from app.utils.response import create_response
from app.utils.handle_exceptions import handle_exceptions
from app.db.database import get_db
from app.core.config import settings
from app.utils.memory_pubsub import memory_pubsub
import logging
from datetime import datetime

router = APIRouter()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 인메모리 PubSub 클라이언트
pubsub_client = memory_pubsub

@router.get("/chat/{room_id}")
@handle_exceptions
async def get_chatting_history(room_id: str, db: Session = Depends(get_db)):
  """채팅방 조회"""
  logger.info(f"📩 클라이언트 채팅방 조회")
  
  response = await ChatService.get_chatting_history(db, room_id)

  if not response:
    return JSONResponse(content=create_response(False, "존재하지 않는 채팅방입니다.", None), status_code=404)

  return JSONResponse(content=create_response(True, "채팅 내역 조회", response), status_code=200)

@router.get("/chat/stream/{room_id}")
async def stream_chat(room_id: str, request: Request):
  """채팅 스트리밍 응답"""
  logger.info(f"📩 클라이언트 SSE 연결: {room_id}")
  
  async def event_generator():
    # PubSub 인터페이스 생성
    client = pubsub_client.pubsub()
    
    # 메타데이터 조회를 위한 변수
    model_name = None
    created_at = None
    
    try:
      # chat:{room_id} 채널 구독
      client.subscribe(f"chat:{room_id}")
      
      # 이미 저장된 답변이 있는지 확인
      saved_answer = pubsub_client.get(f"answer:{room_id}")
      
      # 메타데이터 가져오기 (모델명, 생성 시간)
      metadata = pubsub_client.get(f"metadata:{room_id}")
      if metadata:
        try:
          metadata_dict = json.loads(metadata.decode('utf-8') if isinstance(metadata, bytes) else metadata)
          model_name = metadata_dict.get("model")
          created_at = metadata_dict.get("created_at")
        except:
          pass
      
      if saved_answer:
        # 이미 저장된 답변이 있으면 클라이언트에 전송
        saved_text = saved_answer.decode('utf-8') if isinstance(saved_answer, bytes) else saved_answer
        response_data = {
          "full": saved_text, 
          "init": True,
          "model": model_name,
          "created_at": created_at or datetime.now().isoformat()
        }
        
        yield {
          "event": "message",
          "id": "init",
          "data": json.dumps(response_data)
        }
      
      # 실시간 메시지 구독
      while True:
        if await request.is_disconnected():
          logger.info(f"📤 클라이언트 연결 종료: {room_id}")
          break
          
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
            except:
              pass
        
        if message and message["type"] == "message":
          data = message["data"].decode("utf-8") if isinstance(message["data"], bytes) else message["data"]
          
          # 기존 데이터에 메타데이터 추가
          try:
            message_data = json.loads(data)
            message_data["model"] = model_name
            message_data["created_at"] = created_at or datetime.now().isoformat()
            data = json.dumps(message_data)
          except:
            pass
            
          yield {
            "event": "message",
            "id": room_id,
            "data": data
          }
        
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
      client.unsubscribe(f"chat:{room_id}")
      client.close()
      logger.info(f"📤 SSE 연결 종료: {room_id}")
  
  return EventSourceResponse(event_generator())

@router.post("/chat/retry/{room_id}")
@handle_exceptions
async def retry_chat(room_id: str, db: Session = Depends(get_db)):
  """재시도 요청"""
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
  
  # 어시스턴트 메시지가 이미 있으면, DB에서 삭제
  if assistant_messages and len(assistant_messages) > 0:
    last_assistant_message = assistant_messages[-1]
    # DB에서 답변 메시지 삭제 로직 추가 필요
    await ChatService.delete_assistant_message(db, last_assistant_message["id"])
  
  # 비동기로 새 Ollama 요청 실행
  asyncio.create_task(ChatService.generate_ollama_answer(room_id, ollama_request))
  
  return JSONResponse(content=create_response(True, "재시도 요청 완료", None), status_code=200)