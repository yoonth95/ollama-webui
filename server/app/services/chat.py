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

logger = logging.getLogger(__name__)

# 인메모리 PubSub
pubsub_client = memory_pubsub

class ChatService:
  @staticmethod
  async def save_user_message(db: Session, user_message: ChatUserMessageType, commit: bool = True):
    """유저 메시지 저장"""
    ChatCrud.save_user_message(db, user_message, commit=commit)
    
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
      pubsub_client.set(f"metadata:{assistant_message.room_id}", json.dumps(metadata))
      
      # 완료 메시지 발행
      await pubsub_client.publish(f"chat:{assistant_message.room_id}", json.dumps({
        "full": assistant_message.content,
        "model": assistant_message.model,
        "created_at": datetime.now().isoformat(),
        "done": True
      }))
      
      return result
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
      pubsub_client.delete(f"answer:{room_id}")
      
      # 초기 메타데이터 저장 - 모델명과 요청 시작 시간
      metadata = {
        "model": model,
        "created_at": datetime.now().isoformat()
      }
      pubsub_client.set(f"metadata:{room_id}", json.dumps(metadata))
      
      async with aiohttp.ClientSession() as session:
        url = f"{settings.OLLAMA_API_BASE_URL}/api/chat"
        
        # API 요청에 스트리밍 옵션 추가
        ollama_request["stream"] = True
        
        async with session.post(url, json=ollama_request) as response:
          if response.status != 200:
            error_text = await response.text()
            logger.error(f"Room {room_id}: Ollama API 오류 - {response.status}, {error_text}")
            # 오류 메시지도 PubSub에 저장
            error_message = json.dumps({"error": True, "message": f"API 오류: {response.status}"})
            await pubsub_client.publish(f"chat:{room_id}", error_message)
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
                await pubsub_client.publish(f"chat:{room_id}", json.dumps({
                  "full": full_answer,
                  "model": model,
                  "created_at": datetime.now().isoformat(),
                  "done": True
                }))
                
                # 채팅방 제목 업데이트 작업 추가 예정 (TODO)
                break
              
              # 텍스트 응답만 처리
              if "message" in chunk_data and "content" in chunk_data["message"]:
                delta = chunk_data["message"]["content"]
                full_answer += delta
                
                # Redis에 현재까지의 전체 답변 저장 및 증분 청크 발행
                pubsub_client.set(f"answer:{room_id}", full_answer)
                await pubsub_client.publish(f"chat:{room_id}", json.dumps({
                  "delta": delta,
                  "full": full_answer,
                  "model": model
                }))
            except json.JSONDecodeError:
              logger.warning(f"Room {room_id}: JSON 파싱 오류 - {chunk_text}")
              continue
      
      logger.info(f"Room {room_id}: Ollama API 응답 처리 완료")
    except Exception as e:
      logger.error(f"Room {room_id}: 답변 생성 중 오류 발생 - {str(e)}")
      # 오류 메시지 PubSub에 저장
      await pubsub_client.publish(f"chat:{room_id}", json.dumps({"error": True, "message": str(e)}))
      
      