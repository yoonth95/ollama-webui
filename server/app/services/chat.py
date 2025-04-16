import json
import asyncio
import traceback
import aiohttp
import logging
import random
from datetime import datetime
from sqlalchemy.orm import Session
from app.db.crud.chat import ChatCrud
from app.schemas.chat import ChatUserMessageType, ChatAssistantMessageType, ChatHistoryResponseType
from app.db.database import SessionLocal
from app.core.config import settings
from app.utils.memory_pubsub import memory_pubsub
from app.utils.chat_manager import active_chats, cancelled_chats, force_stopped_chats, completed_chats

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
    new_session = False
    if db is None:
      db = SessionLocal()
      new_session = True
      
    try:
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
      if new_session:
        db.close()

  @staticmethod
  async def generate_ollama_answer(room_id: str, ollama_request: dict):
    """Ollama API를 사용하여 답변 생성 및 PubSub에 저장"""
    logger.info(f"Room {room_id}: Ollama API 호출 시작")
    full_answer = ""
    model = ollama_request.get("model", "unknown")
    
    try:
      # 현재 진행 중인 응답 생성 태스크 등록
      active_chats[room_id] = asyncio.current_task()
      
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
        # 취소 여부 확인
        if room_id in cancelled_chats and cancelled_chats[room_id]:
          logger.info(f"Room {room_id}: Ollama API 호출 취소됨")
          
          # 강제 취소인지 확인
          is_force_stopped = room_id in force_stopped_chats and force_stopped_chats[room_id]
          
          # 강제 취소인 경우, 저장하지 않고 메시지만 발행
          if is_force_stopped:
            logger.info(f"Room {room_id}: 강제 취소로 인해 저장하지 않음")
            
            # 강제 취소 메시지 발행
            await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", json.dumps({
              "force_stopped": True,
              "cancelled": True,
              "message": "응답 생성이 강제 중단되었습니다. 답변이 저장되지 않았습니다.",
              "partial_saved": False
            }))
            
            # 인메모리 데이터 삭제
            pubsub_client.delete(f"{ANSWER_KEY_PREFIX}{room_id}")
            return
            
          # 취소 시점의 답변이 저장돼있는지 확인만 하고 저장은 cancel_chat에서 처리함
          cached_answer = await ChatService.get_cached_answer(room_id)
          
          # 일반 취소 로직 - 조건 검사만 진행
          if cached_answer:
            is_valid = await ChatService.is_valid_answer_for_storage(cached_answer)
            
            if is_valid:
              logger.info(f"Room {room_id}: Ollama API 호출 취소 - cancel_chat에서 저장 처리함 ({len(cached_answer)} 자)")
              
              # 취소 메시지 발행 (부분 저장 알림만)
              await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", json.dumps({
                "cancelled": True,
                "message": "응답 생성이 취소되었습니다. 지금까지 생성된 답변이 저장되었습니다.",
                "partial_saved": True
              }))
            else:
              # 유효하지 않은 답변은 저장하지 않음
              if "<think>" in cached_answer and "</think>" not in cached_answer:
                message = "응답 생성이 취소되었습니다. (생성 중이던 사고 과정이 완성되지 않아 저장되지 않았습니다.)"
              else:
                message = "응답 생성이 취소되었습니다. 답변이 너무 짧아 저장되지 않았습니다."
              
              logger.info(f"Room {room_id}: Ollama API 호출 취소 - 유효하지 않은 답변 ({len(cached_answer)} 자)")
              
              # 취소 메시지 발행 (저장하지 않음)
              await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", json.dumps({
                "cancelled": True,
                "message": message,
                "partial_saved": False
              }))
          else:
            # 답변이 없는 경우
            await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", json.dumps({
              "cancelled": True,
              "message": "응답 생성이 취소되었습니다.",
              "partial_saved": False
            }))
        
          return
          
        try:
          async with aiohttp.ClientSession() as session:
            url = f"{settings.OLLAMA_API_BASE_URL}/api/chat"
            ollama_request["stream"] = True
            timeout = aiohttp.ClientTimeout(total=30) # 요청 타임아웃 설정 (30초)
            
            async with session.post(url, json=ollama_request, timeout=timeout) as response:
              # 네트워크 오류 시뮬레이션
              if random.random() < 0.8:
                logger.info(f"Room {room_id}: 네트워크 오류 시뮬레이션 발생")
                raise aiohttp.ClientError("Simulated network error")
              
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
                # 취소 여부 확인
                if room_id in cancelled_chats and cancelled_chats[room_id]:
                  logger.info(f"Room {room_id}: 응답 생성 중 취소됨")
                  
                  # 강제 취소인지 확인
                  is_force_stopped = room_id in force_stopped_chats and force_stopped_chats[room_id]
                  
                  # 강제 취소인 경우, 저장하지 않고 메시지만 발행
                  if is_force_stopped:
                    logger.info(f"Room {room_id}: 응답 청크 처리 중 강제 취소로 인해 저장하지 않음")
                    
                    # 강제 취소 메시지 발행
                    await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", json.dumps({
                      "force_stopped": True,
                      "cancelled": True,
                      "message": "응답 생성이 강제 중단되었습니다. 답변이 저장되지 않았습니다.",
                      "partial_saved": False
                    }))
                    
                    # 인메모리 데이터 삭제
                    pubsub_client.delete(f"{ANSWER_KEY_PREFIX}{room_id}")
                    return
                  
                  # 취소 시 cancel_chat 함수에서 저장 처리
                  is_valid = await ChatService.is_valid_answer_for_storage(full_answer)
                  
                  if not is_valid:
                    # 유효하지 않은 답변인 경우 (너무 짧거나 <think> 태그 불완전)
                    if full_answer and "<think>" in full_answer and "</think>" not in full_answer:
                      message = "응답 생성이 취소되었습니다. (생성 중이던 사고 과정이 완성되지 않아 저장되지 않았습니다.)"
                      logger.info(f"Room {room_id}: <think> 태그가 닫히지 않아 저장하지 않음")
                    else:
                      message = "응답 생성이 취소되었습니다."
                    
                    # 취소 메시지 발행 (저장 없음)
                    await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", json.dumps({
                      "cancelled": True,
                      "message": message,
                      "partial_saved": False
                    }))
                  else:
                    # 충분한 길이의 유효한 답변이 있는 경우, cancel_chat 함수에서 저장
                    logger.info(f"Room {room_id}: 응답 생성 중 취소 - 저장은 cancel_chat에서 처리 ({len(full_answer)} 자)")
                    
                    # 인메모리에 데이터 업데이트 - 최종 상태 저장 
                    pubsub_client.set(f"{ANSWER_KEY_PREFIX}{room_id}", full_answer, MESSAGE_EXPIRE_TIME)
                    
                    # 취소 메시지 발행
                    await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", json.dumps({
                      "cancelled": True,
                      "message": "응답 생성이 취소되었습니다. 지금까지 생성된 답변이 저장되었습니다.",
                      "partial_saved": True,
                      "partial_length": len(full_answer)
                    }))
                  
                  return
                
                chunk_text = chunk.decode('utf-8').strip()
                if not chunk_text:
                  continue
                
                try:
                  chunk_data = json.loads(chunk_text)
                  
                  # 완료 메시지인 경우
                  if "done" in chunk_data and chunk_data["done"]:
                    # 완료 상태 기록
                    completed_chats[room_id] = True
                    
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
        
        except aiohttp.ClientError as e:
          logger.error(f"Room {room_id}: 네트워크 오류 발생 - {str(e)}")
          
          # 재시도 여부 확인
          if current_retry < max_retries:
            logger.info(f"Room {room_id}: 네트워크 오류 재시도 ({current_retry + 1}/{max_retries})")
            current_retry += 1
            
            # 재시도 알림 전송
            await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", json.dumps({
              "warning": True,
              "message": f"네트워크 오류, 재시도 중입니다 ({current_retry}/{max_retries})..."
            }))
            
            # 잠시 대기 후 재시도
            await asyncio.sleep(1)
          else:
            # 최대 재시도 횟수 초과
            error_message = json.dumps({
              "error": True,
              "error_type": ERROR_TYPE_NETWORK,
              "message": "네트워크 오류, 최대 재시도 횟수 초과"
            })
            await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", error_message)
            return

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
      
      # 생성된 답변이 있을 경우 저장 (오류 발생 시에도)
      if full_answer and len(full_answer) >= 10:
        logger.info(f"Room {room_id}: 오류 발생했지만 생성된 답변 있음 ({len(full_answer)} 자) - 인메모리에 저장")
        # 인메모리에 저장 - cancel_chat 함수에서 처리하도록
        pubsub_client.set(f"{ANSWER_KEY_PREFIX}{room_id}", full_answer, MESSAGE_EXPIRE_TIME)
      
      await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", json.dumps({
        "error": True,
        "error_type": error_type,
        "message": error_message
      }))
    finally:
      # 활성 채팅 목록에서 제거
      if room_id in active_chats:
        del active_chats[room_id]

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
    
  @staticmethod
  async def is_valid_answer_for_storage(answer: str) -> bool:
    """저장 가능한 유효한 답변인지 확인
    1. 최소 길이 확인 (10자 이상으로 변경)
    2. <think> 태그가 열려 있지만 닫히지 않은 경우 확인
    3. 추론 과정만 있는 경우 확인
    """
    if not answer or len(answer) < 10:
      return False
      
    # <think> 태그 처리 - 열려있는데 닫히지 않은 경우 저장하지 않음
    if "<think>" in answer and "</think>" not in answer:
      return False
    
    # 추론 과정만 있거나, 완성되지 않은 답변인지 검사
    # 추론 과정은 <think>...</think> 형식으로 되어 있음
    # 추론 과정만 있거나 추론 과정 이후 내용이 매우 짧은 경우(20자 미만) 저장하지 않음
    if "<think>" in answer and "</think>" in answer:
      think_end_pos = answer.rfind("</think>") + len("</think>")
      remaining_content = answer[think_end_pos:].strip()
      if not remaining_content or len(remaining_content) < 20:
        return False
      
    return True

  @staticmethod
  async def cancel_chat(room_id: str):
    """채팅 응답 생성 중단"""
    logger.info(f"Room {room_id}: 채팅 응답 생성 중단 요청")
    
    # 이미 완료된 응답인지 확인
    if room_id in completed_chats and completed_chats[room_id]:
      logger.info(f"Room {room_id}: 이미 완료된 응답이므로 중단 처리 건너뜀")
      
      # 취소 메시지만 발행 (저장 없음)
      await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", json.dumps({
        "cancelled": True,
        "message": "응답이 이미 완료되었습니다.",
        "already_completed": True
      }))
      
      # 취소 플래그만 설정
      cancelled_chats[room_id] = True
      
      # 5초 후 취소 상태 자동 정리
      asyncio.create_task(ChatService._clear_cancel_and_force_stop_state(room_id, 5))
      
      return False
    
    # 현재 진행 중인 채팅인지 확인
    is_active = room_id in active_chats
    
    # 취소 플래그 설정
    cancelled_chats[room_id] = True
    
    # 인메모리에 저장된 답변 확인
    cached_answer = await ChatService.get_cached_answer(room_id)
    cached_metadata = await ChatService.get_metadata(room_id)
    
    # 답변 유효성 확인
    is_valid = cached_answer and await ChatService.is_valid_answer_for_storage(cached_answer)
    
    # SSE 연결을 통해 부분적으로 전달된 답변이 있고 유효한 경우에만 DB에 저장
    if is_valid:
      logger.info(f"Room {room_id}: 부분 생성된 답변 저장 (길이: {len(cached_answer)})")
      
      model = cached_metadata.get("model", "unknown") if cached_metadata else "unknown"
      
      # 부분 답변 DB 저장
      assistant_message = ChatAssistantMessageType(
        room_id=room_id,
        content=cached_answer,
        model=model
      )
      
      # 답변 저장 작업 실행 (비동기 태스크 사용하지 않고 즉시 실행)
      try:
        db = SessionLocal()
        await ChatService.save_assistant_message(db, assistant_message, commit=True)
        
        # 저장 성공 시 로그
        logger.info(f"Room {room_id}: 답변 DB 저장 성공 (길이: {len(cached_answer)})")
        
        # 완료 상태로 표시 (부분 답변이지만 저장이 완료됨)
        completed_chats[room_id] = True
      except Exception as e:
        logger.error(f"Room {room_id}: 취소 중 부분 답변 저장 실패 - {str(e)}")
        is_valid = False
      finally:
        db.close()
      
      # 취소 메시지에 저장 성공 정보 추가
      await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", json.dumps({
        "cancelled": True,
        "message": "응답 생성이 취소되었습니다. 지금까지 생성된 답변이 저장되었습니다.",
        "partial_saved": True,
        "partial_length": len(cached_answer)
      }))
    else:
      # 저장 불가능한 답변이면 저장하지 않고 일반 취소 메시지 발행
      if cached_answer and "<think>" in cached_answer and "</think>" not in cached_answer:
        logger.info(f"Room {room_id}: <think> 태그가 닫히지 않아 저장하지 않음")
        message = "응답 생성이 취소되었습니다. (생성 중이던 사고 과정이 완성되지 않아 저장되지 않았습니다.)"
      else:
        message = "응답 생성이 취소되었습니다."
        
      await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", json.dumps({
        "cancelled": True,
        "message": message,
        "partial_saved": False
      }))
    
    # 인메모리 데이터 정리 - 부분 답변 저장 후 삭제
    pubsub_client.delete(f"{ANSWER_KEY_PREFIX}{room_id}")
    
    # 5초 후 취소 상태 자동 정리 (새로운 요청 허용을 위함)
    asyncio.create_task(ChatService._clear_cancel_and_force_stop_state(room_id, 5))
    
    return is_active
    
  @staticmethod
  async def _clear_cancel_and_force_stop_state(room_id: str, delay: int):
    """일정 시간 후 취소 및 강제 취소 상태 초기화"""
    await asyncio.sleep(delay)
    if room_id in cancelled_chats:
      del cancelled_chats[room_id]
    if room_id in force_stopped_chats:
      del force_stopped_chats[room_id]
    if room_id in completed_chats:
      del completed_chats[room_id]
    logger.info(f"Room {room_id}: 취소 및 강제 취소 상태 초기화 완료")
    
  @staticmethod
  async def force_stop_chat(room_id: str):
    """채팅 응답 강제 중단 (DB 저장하지 않음)"""
    logger.info(f"Room {room_id}: 채팅 응답 강제 중단 요청")
    
    # 현재 진행 중인 채팅인지 확인
    is_active = room_id in active_chats
    
    # 취소 및 강제 취소 플래그 설정
    cancelled_chats[room_id] = True
    force_stopped_chats[room_id] = True
    
    # 인메모리 데이터 즉시 삭제
    pubsub_client.delete(f"{ANSWER_KEY_PREFIX}{room_id}")
    
    # 강제 취소 메시지 발행
    await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", json.dumps({
      "force_stopped": True,  # 강제 취소 플래그
      "cancelled": True,
      "message": "응답 생성이 강제 중단되었습니다. 답변이 저장되지 않았습니다.",
      "partial_saved": False
    }))
    
    # 5초 후 취소 상태 자동 정리
    asyncio.create_task(ChatService._clear_cancel_and_force_stop_state(room_id, 5))
    
    return is_active
      
      