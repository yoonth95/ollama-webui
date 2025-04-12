import asyncio
import aiohttp
import json
import logging
from sqlalchemy.orm import Session
from app.schemas.chat import ChatUserMessageType, ChatHistoryResponseType, ChatAssistantMessageType
from app.db.crud.chat import ChatCrud
from app.core.config import settings
from app.utils.memory_pubsub import memory_pubsub
from app.db.database import SessionLocal
from datetime import datetime
import traceback
import random

logger = logging.getLogger(__name__)

# 인메모리 PubSub
pubsub_client = memory_pubsub

# 상수 정의
METADATA_KEY_PREFIX = "metadata:"
ANSWER_KEY_PREFIX = "answer:"
CHAT_CHANNEL_PREFIX = "chat:"
MESSAGE_EXPIRE_TIME = 60 * 60 * 24  # 24시간

# 오류 타입 상수
ERROR_TYPE_NETWORK = "network"
ERROR_TYPE_TIMEOUT = "timeout"
ERROR_TYPE_MODEL = "model"
ERROR_TYPE_CONTENT = "content"
ERROR_TYPE_UNKNOWN = "unknown"

class ChatService:
  @staticmethod
  async def save_user_message(db: Session, user_message: ChatUserMessageType, commit: bool = True):
    """유저 메시지 저장"""
    return ChatCrud.save_user_message(db, user_message, commit=commit)
    
  @staticmethod
  async def save_assistant_message(db: Session, assistant_message: ChatAssistantMessageType, commit: bool = True):
    """어시스턴트 메시지 저장"""
    # db가 None인 경우 새 세션 생성
    new_session = False
    if db is None:
      db = SessionLocal()
      new_session = True
      
    try:
      result = ChatCrud.save_assistant_message(db, assistant_message, commit=commit)
      
      # 메타데이터 저장 (모델명, 생성 시간)
      metadata = {
        "model": assistant_message.model,
        "created_at": datetime.now().isoformat()
      }
      pubsub_client.set(f"{METADATA_KEY_PREFIX}{assistant_message.room_id}", json.dumps(metadata), MESSAGE_EXPIRE_TIME)
      
      # 완료 메시지 발행
      await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{assistant_message.room_id}", json.dumps({
        "full": assistant_message.content,
        "model": assistant_message.model,
        "created_at": datetime.now().isoformat(),
        "done": True
      }))
      
      return result
    except Exception as e:
      logger.error(f"어시스턴트 메시지 저장 오류: {str(e)}")
      if commit:
        db.rollback()
      # 오류 메시지 발행
      await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{assistant_message.room_id}", json.dumps({
        "error": True,
        "error_type": ERROR_TYPE_UNKNOWN,
        "message": f"메시지 저장 오류: {str(e)}"
      }))
      return None
    finally:
      # 새로 생성한 세션인 경우에만 닫기
      if new_session:
        db.close()
    
  @staticmethod
  async def get_chatting_history(db: Session, room_id: str):
    """채팅방 조회"""
    result = ChatCrud.get_chatting_history(db, room_id)
    
    if not result:
      return False
    
    return [ChatHistoryResponseType.model_validate(message).model_dump() for message in result]

  @staticmethod
  async def delete_assistant_message(db: Session, message_id: str):
    """어시스턴트 메시지 삭제"""
    # db가 None인 경우 새 세션 생성
    new_session = False
    if db is None:
      db = SessionLocal()
      new_session = True
      
    try:
      # 메시지 삭제
      result = ChatCrud.delete_assistant_message(db, message_id)
      
      if result:
        logger.info(f"어시스턴트 메시지 삭제 성공: {message_id}")
      else:
        logger.warning(f"어시스턴트 메시지 삭제 실패 (없는 메시지): {message_id}")
        
      return result
    except Exception as e:
      logger.error(f"어시스턴트 메시지 삭제 중 오류 발생: {str(e)}")
      return False
    finally:
      # 새로 생성한 세션인 경우에만 닫기
      if new_session:
        db.close()

  @staticmethod
  async def generate_ollama_answer(room_id: str, ollama_request: dict):
    """Ollama API를 사용하여 답변 생성 및 PubSub에 저장"""
    logger.info(f"Room {room_id}: Ollama API 호출 시작")
    full_answer = ""
    model = ollama_request.get("model", "unknown")
    
    try:
      # 이전 응답이 있을 경우 삭제
      pubsub_client.delete(f"{ANSWER_KEY_PREFIX}{room_id}")
      
      # 초기 메타데이터 저장 - 모델명과 요청 시작 시간
      metadata = {
        "model": model,
        "created_at": datetime.now().isoformat()
      }
      pubsub_client.set(f"{METADATA_KEY_PREFIX}{room_id}", json.dumps(metadata), MESSAGE_EXPIRE_TIME)
      
      # API 호출 시작 알림
      await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", json.dumps({
        "status": "generating",
        "model": model,
        "timestamp": datetime.now().isoformat()
      }))
      
      # API 호출 최대 시도 횟수
      max_retries = 2
      current_retry = 0
      
      while current_retry <= max_retries:
        try:
          async with aiohttp.ClientSession() as session:
            url = f"{settings.OLLAMA_API_BASE_URL}/api/chat"
            
            # API 요청에 스트리밍 옵션 추가
            ollama_request["stream"] = True
            
            # 요청 타임아웃 설정 (30초)
            timeout = aiohttp.ClientTimeout(total=30)
            
            async with session.post(url, json=ollama_request, timeout=timeout) as response:
              if response.status != 200:
                error_text = await response.text()
                logger.error(f"Room {room_id}: Ollama API 오류 - {response.status}, {error_text}")
                
                # 재시도 여부 확인
                if current_retry < max_retries:
                  logger.info(f"Room {room_id}: Ollama API 재시도 ({current_retry + 1}/{max_retries})")
                  current_retry += 1
                  
                  # 오류 알림 전송
                  await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", json.dumps({
                    "warning": True,
                    "message": f"API 요청 실패, 재시도 중입니다 ({current_retry}/{max_retries})..."
                  }))
                  
                  # 잠시 대기 후 재시도
                  await asyncio.sleep(1)
                  continue
                else:
                  # 마지막 시도에서도 실패한 경우
                  error_message = json.dumps({
                    "error": True,
                    "error_type": ERROR_TYPE_MODEL,
                    "message": f"API 오류 ({response.status}): {error_text}"
                  })
                  await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", error_message)
                  return
              
              # 응답 청크 처리
              async for chunk in response.content:
                chunk_text = chunk.decode('utf-8').strip()
                if not chunk_text:
                  continue
                
                try:
                  chunk_data = json.loads(chunk_text)
                  
                  # 완료 메시지인 경우
                  if "done" in chunk_data and chunk_data["done"]:
                    # 최종 답변을 데이터베이스에 저장
                    assistant_message = ChatAssistantMessageType(
                      room_id=room_id,
                      content=full_answer,
                      model=model
                    )
                    # 비동기 태스크로 저장 (db=None으로 함수 내에서 새 세션 생성)
                    asyncio.create_task(ChatService.save_assistant_message(None, assistant_message, commit=True))
                    
                    # 완료 메시지 발행
                    await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", json.dumps({
                      "full": full_answer,
                      "model": model,
                      "created_at": datetime.now().isoformat(),
                      "done": True
                    }))
                    
                    logger.info(f"Room {room_id}: Ollama API 응답 처리 완료")
                    return
                  
                  # 텍스트 응답만 처리
                  if "message" in chunk_data and "content" in chunk_data["message"]:
                    delta = chunk_data["message"]["content"]
                    full_answer += delta
                    
                    # Redis에 현재까지의 전체 답변 저장 및 증분 청크 발행
                    pubsub_client.set(f"{ANSWER_KEY_PREFIX}{room_id}", full_answer, MESSAGE_EXPIRE_TIME)
                    await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", json.dumps({
                      "delta": delta,
                      "full": full_answer,
                      "model": model
                    }))
                except json.JSONDecodeError:
                  logger.warning(f"Room {room_id}: JSON 파싱 오류 - {chunk_text}")
                  continue
              
              # 루프를 성공적으로 완료하면 재시도 루프 종료
              break
          
        except asyncio.TimeoutError:
          logger.warning(f"Room {room_id}: Ollama API 요청 타임아웃")
          
          # 재시도 여부 확인
          if current_retry < max_retries:
            logger.info(f"Room {room_id}: Ollama API 타임아웃 재시도 ({current_retry + 1}/{max_retries})")
            current_retry += 1
            
            # 타임아웃 알림 전송
            await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", json.dumps({
              "warning": True,
              "message": f"요청 시간 초과, 재시도 중입니다 ({current_retry}/{max_retries})..."
            }))
            
            # 잠시 대기 후 재시도
            await asyncio.sleep(1)
          else:
            # 최대 재시도 횟수 초과
            error_message = json.dumps({
              "error": True,
              "error_type": ERROR_TYPE_TIMEOUT,
              "message": "요청 시간이 반복적으로 초과되었습니다. 나중에 다시 시도해주세요."
            })
            await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", error_message)
            return
      
    except Exception as e:
      logger.error(f"Room {room_id}: 답변 생성 중 오류 발생 - {str(e)}")
      logger.error(traceback.format_exc())
      
      # 오류 메시지 PubSub에 저장
      error_message = f"오류가 발생했습니다: {str(e)}"
      
      # 오류 유형 추정
      error_type = ERROR_TYPE_UNKNOWN
      error_str = str(e).lower()
      if "network" in error_str or "connect" in error_str:
        error_type = ERROR_TYPE_NETWORK
      elif "timeout" in error_str or "시간 초과" in error_str:
        error_type = ERROR_TYPE_TIMEOUT
      elif "model" in error_str or "load" in error_str:
        error_type = ERROR_TYPE_MODEL
      
      await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", json.dumps({
        "error": True,
        "error_type": error_type,
        "message": error_message
      }))
      
  @staticmethod
  async def get_cached_answer(room_id: str):
    """캐시된 답변 조회"""
    cached_answer = pubsub_client.get(f"{ANSWER_KEY_PREFIX}{room_id}")
    if not cached_answer:
      return None
      
    return cached_answer.decode('utf-8') if isinstance(cached_answer, bytes) else cached_answer
    
  @staticmethod
  async def get_metadata(room_id: str):
    """메타데이터 조회"""
    metadata = pubsub_client.get(f"{METADATA_KEY_PREFIX}{room_id}")
    if not metadata:
      return None
      
    try:
      return json.loads(metadata.decode('utf-8') if isinstance(metadata, bytes) else metadata)
    except Exception as e:
      logger.error(f"메타데이터 파싱 오류: {e}")
      return None
      
      