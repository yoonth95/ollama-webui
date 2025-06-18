import json
import asyncio
import traceback
import aiohttp
import logging
import random
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.crud.chat import ChatCrud
from app.db.database import SessionLocal
from app.schemas.chat import ChatUserMessageType, ChatAssistantMessageType, ChatHistoryResponseType, ChatAssistantUpdateMessageType
from app.utils.memory_pubsub import memory_pubsub
from app.utils.chat_manager import active_chats, cancelled_chats, force_stopped_chats, completed_chats

logger = logging.getLogger(__name__)

# 인메모리 PubSub
pubsub_client = memory_pubsub

# 상수 정의
METADATA_KEY_PREFIX = "metadata:"
ANSWER_KEY_PREFIX = "answer:"
CHAT_CHANNEL_PREFIX = "chat:"
ERROR_COUNTER_PREFIX = "error_counter:"  # 오류 카운터 키 접두사
MESSAGE_EXPIRE_TIME = 60 * 60 * 24  # 24시간
MAX_RETRIES = 3

# 테스트 시뮬레이션 설정 (이 변수들을 조정하여 테스트)
TEST_ENABLED = False         # 테스트 모드 활성화 여부
TEST_NETWORK_ERROR_RATE = 0  # 네트워크 오류 발생 확률 (0~1)
TEST_TIMEOUT_ERROR_RATE = 0  # 타임아웃 오류 발생 확률 (0~1)
TEST_MODEL_ERROR_RATE = 0    # 모델 오류 발생 확률 (0~1)
TEST_CONTENT_ERROR_RATE = 0  # 콘텐츠 파싱 오류 발생 확률 (0~1)

# 오류 타입 상수
ERROR_TYPE_NETWORK = "NETWORK"
ERROR_TYPE_TIMEOUT = "TIMEOUT"
ERROR_TYPE_MODEL = "MODEL"
ERROR_TYPE_CONTENT = "CONTENT"
ERROR_TYPE_UNKNOWN = "UNKNOWN"

class ChatService:
  @staticmethod
  async def save_user_message(db: Session, user_message: ChatUserMessageType, commit: bool = True):
    """유저 메시지 저장"""
    user_message_data = ChatCrud.save_user_message(db, user_message, commit=commit)
    return {
      "id": user_message_data.id,
    }
    
  @staticmethod
  async def save_assistant_message(db: Session, assistant_message: ChatAssistantMessageType, commit: bool = True):
    """어시스턴트 메시지 저장"""
    # db가 None인 경우 새 세션 생성
    new_session = False
    if db is None:
      db = SessionLocal()
      new_session = True
      
    try:
      # raise ValueError("일부러 발생시킨 테스트 에러")
      result = ChatCrud.save_assistant_message(db, assistant_message, commit=commit)
      
      # 메타데이터 저장 (모델명, 생성 시간)
      metadata = {
        "model": assistant_message.model,
        "created_at": datetime.now().isoformat()
      }
      pubsub_client.set(f"{METADATA_KEY_PREFIX}{assistant_message.room_id}", json.dumps(metadata), MESSAGE_EXPIRE_TIME)
      return result
    except Exception as e:
      logger.error(f"어시스턴트 메시지 저장 오류: {str(e)}")
      if commit:
        db.rollback()
      # 오류 메시지 발행
      await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{assistant_message.room_id}", json.dumps({
        "error": True,
        "error_type": ERROR_TYPE_UNKNOWN,
        "message": f"메시지 저장 오류: {str(e)}",
        "model": assistant_message.model,
        "created_at": datetime.now().isoformat()
      }))
      return None
    finally:
      # 새로 생성한 세션인 경우에만 닫기
      if new_session:
        db.close()
        
  @staticmethod
  async def update_assistant_message(db: Session, assistant_update_message: ChatAssistantUpdateMessageType, commit: bool = True):
    """어시스턴트 메시지 업데이트"""
    # db가 None인 경우 새 세션 생성
    new_session = False
    if db is None:
      db = SessionLocal()
      new_session = True
    
    try:
      # raise ValueError("일부러 발생시킨 테스트 에러")
      result = ChatCrud.update_assistant_message(db, assistant_update_message, commit=commit)
      
      # 메타데이터 저장 (모델명, 생성 시간)
      metadata = {
        "model": assistant_update_message.model,
        "created_at": datetime.now().isoformat()
      }
      pubsub_client.set(f"{METADATA_KEY_PREFIX}{assistant_update_message.room_id}", json.dumps(metadata), MESSAGE_EXPIRE_TIME)
      return result
    except Exception as e:
      logger.error(f"답변 재시도 오류: {str(e)}")
      if commit:
        db.rollback()
      # 오류 메시지 발행
      await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{assistant_update_message.room_id}", json.dumps({
        "error": True,
        "error_type": ERROR_TYPE_UNKNOWN,
        "message": f"답변 재시도 오류: {str(e)}",
        "model": assistant_update_message.model,
        "created_at": datetime.now().isoformat(),
        "user_message_id": assistant_update_message.user_message_id,
        "assistant_message_id": assistant_update_message.answer_id
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
  async def generate_ollama_answer(room_id: str, ollama_request: dict, user_message_id: str, answer_id: str = ""):
    """Ollama API를 사용하여 답변 생성 및 PubSub에 저장"""
    logger.info(f"Room {room_id}: Ollama API 호출 시작")
    full_answer = ""
    model = ollama_request.get("model", "unknown")
    
    try:
      # 세션 초기화 및 메타데이터 설정
      await ChatService._initialize_chat_session(room_id, model, user_message_id, publish_status=(answer_id==""))
      
      logger.debug(f"Room {room_id}: generate_ollama_answer 호출 – answer_id={answer_id}")
      
      result = await ChatService._process_ollama_api_request(room_id, ollama_request, model, user_message_id, answer_id)
      if result and answer_id:
        db = SessionLocal()
        try:
          update_message = ChatAssistantUpdateMessageType(
            room_id=room_id,
            content=result,
            model=model,
            user_message_id=user_message_id,
            answer_id=answer_id
          )
          ChatCrud.update_assistant_message(db, update_message)
          logger.info(f"답변 업데이트 완료: {answer_id}")
        except Exception as e:
          logger.error(f"답변 업데이트 중 오류 발생: {str(e)}")
        finally:
          db.close()
      return result
    except Exception as e:
      # 예외 처리
      await ChatService._handle_general_exception(room_id, full_answer, e, model, user_message_id, answer_id)
    finally:
      # 활성 채팅 목록에서 제거
      if room_id in active_chats:
        del active_chats[room_id]

  @staticmethod
  async def _initialize_chat_session(room_id: str, model: str, user_message_id: str, publish_status: bool = True):
    """채팅 세션 초기화 및 메타데이터 설정"""
    # 기존 상태, 캐시, 채널 큐 초기화 (재시도 시 이전 데이터가 섞이지 않도록)
    ChatService._reset_room_state(room_id)

    # 현재 진행 중인 응답 생성 태스크 등록
    active_chats[room_id] = asyncio.current_task()
    
    # 이전 응답이 있을 경우 삭제
    pubsub_client.delete(f"{ANSWER_KEY_PREFIX}{room_id}")
    
    # 초기 메타데이터 저장 - 모델명과 요청 시작 시간, user_message_id
    metadata = {
      "model": model,
      "created_at": datetime.now().isoformat(),
      "user_message_id": user_message_id
    }
    pubsub_client.set(f"{METADATA_KEY_PREFIX}{room_id}", json.dumps(metadata), MESSAGE_EXPIRE_TIME)
    
    # API 호출 시작 알림 (retry 시 중복 방지를 위해 옵션)
    if publish_status:
      await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", json.dumps({
        "status": "generating",
        "model": model,
        "timestamp": datetime.now().isoformat()
      }))

  @staticmethod
  async def _process_ollama_api_request(room_id: str, ollama_request: dict, model: str, user_message_id: str, answer_id: str = ""):
    """Ollama API 요청 처리 및 재시도 로직"""
    current_retry = 0
    full_answer = ""
    
    while current_retry <= MAX_RETRIES:
      # 취소 여부 확인
      if await ChatService._check_if_cancelled(room_id, full_answer):
        return
      
      try:
        # API 요청 실행
        result = await ChatService._execute_api_request(room_id, ollama_request, model, full_answer, user_message_id, answer_id)
        if result is not None:  # 정상적으로 완료되었거나 취소되었을 경우
          return result
        break
      
      except aiohttp.ClientError as e:
        # 네트워크 오류 처리
        if not await ChatService._handle_retry(room_id, current_retry, ERROR_TYPE_NETWORK, str(e), user_message_id, answer_id):
          return
        current_retry += 1
      
      except asyncio.TimeoutError:
        # 타임아웃 오류 처리
        if not await ChatService._handle_retry(room_id, current_retry, ERROR_TYPE_TIMEOUT, "", user_message_id, answer_id):
          return
        current_retry += 1

  @staticmethod
  async def _check_if_cancelled(room_id: str, full_answer: str = ""):
    """취소 여부 확인 및 처리"""
    if room_id in cancelled_chats and cancelled_chats[room_id]:
      logger.info(f"Room {room_id}: Ollama API 호출 취소됨")
      
      # 강제 취소인지 확인
      is_force_stopped = room_id in force_stopped_chats and force_stopped_chats[room_id]
      
      if is_force_stopped:
        # 강제 취소 처리
        await ChatService._handle_force_stop(room_id)
        return True
      
      # 일반 취소 처리
      cached_answer = await ChatService.get_cached_answer(room_id) or full_answer
      await ChatService._handle_normal_cancellation(room_id, cached_answer)
      return True
    
    return False

  @staticmethod
  async def _handle_force_stop(room_id: str):
    """강제 취소 처리"""
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

  @staticmethod
  async def _handle_normal_cancellation(room_id: str, cached_answer: str):
    """일반 취소 처리"""
    if not cached_answer:
      # 답변이 없는 경우
      await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", json.dumps({
        "cancelled": True,
        "message": "응답 생성이 취소되었습니다.",
        "partial_saved": False
      }))
      return
    
    # 유효성 검사
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
      message = ChatService._get_invalid_answer_message(cached_answer)
      logger.info(f"Room {room_id}: Ollama API 호출 취소 - 유효하지 않은 답변 ({len(cached_answer)} 자)")
      
      # 취소 메시지 발행 (저장하지 않음)
      await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", json.dumps({
        "cancelled": True,
        "message": message,
        "partial_saved": False
      }))

  @staticmethod
  def _get_invalid_answer_message(answer: str):
    """유효하지 않은 답변 메시지 생성"""
    if answer and "<think>" in answer and "</think>" not in answer:
      return "응답 생성이 취소되었습니다. (생성 중이던 사고 과정이 완성되지 않아 저장되지 않았습니다.)"
    return "응답 생성이 취소되었습니다. 답변이 너무 짧아 저장되지 않았습니다."

  @staticmethod
  async def _execute_api_request(room_id: str, ollama_request: dict, model: str, full_answer: str = "", user_message_id: str = None, answer_id: str = ""):
    """API 요청 실행 및 응답 처리"""
    async with aiohttp.ClientSession() as session:
      url = f"{settings.OLLAMA_API_BASE_URL}/api/chat"
      ollama_request["stream"] = True
      timeout = aiohttp.ClientTimeout(
        total=None,
        sock_connect=30,  # 연결 타임아웃
        sock_read=10      # 데이터 읽기 중 10초 동안 아무것도 안 오면 timeout 발생
      )
      
      # TEST: 테스트 시뮬레이션 실행
      if TEST_ENABLED:
        await ChatService._run_test_simulations(room_id)
      
      async with session.post(url, json=ollama_request, timeout=timeout) as response:
        if response.status != 200:
          return await ChatService._handle_api_error_response(room_id, response, user_message_id, answer_id)
        
        # 응답 청크 처리
        result = await ChatService._process_response_chunks(room_id, response, model, full_answer, user_message_id, answer_id)
        return result

  @staticmethod
  async def _run_test_simulations(room_id: str):
    """테스트 시뮬레이션 코드"""
    # 네트워크 오류 시뮬레이션
    if random.random() < TEST_NETWORK_ERROR_RATE:
      logger.info(f"Room {room_id}: 네트워크 오류 시뮬레이션 발생")
      raise aiohttp.ClientError("Simulated network error")
    
    # 타임아웃 시뮬레이션
    if random.random() < TEST_TIMEOUT_ERROR_RATE:
      logger.info(f"Room {room_id}: 타임아웃 시뮬레이션 발생")
      await asyncio.sleep(31)  # 타임아웃보다 길게 대기
      raise asyncio.TimeoutError("Simulated timeout error")
    
    # 모델 오류 시뮬레이션
    if random.random() < TEST_MODEL_ERROR_RATE:
      logger.info(f"Room {room_id}: Ollama API 모델 오류 시뮬레이션 발생")
      raise Exception("Simulated model error: Invalid model name")

  @staticmethod
  async def _process_response_chunks(room_id: str, response, model: str, full_answer: str = "", user_message_id: str = None, answer_id: str = ""):
    """응답 청크 처리"""
    current_answer = full_answer
    error_counter = 0
    
    async for chunk in response.content:
      # 취소 여부 확인
      if room_id in cancelled_chats and cancelled_chats[room_id]:
        # 취소 처리
        await ChatService._handle_cancellation_during_streaming(room_id, current_answer, user_message_id)
        return None
      
      chunk_text = chunk.decode('utf-8').strip()
      if not chunk_text:
        continue
      
      # TEST: 콘텐츠 파싱 오류 시뮬레이션
      if TEST_ENABLED and random.random() < TEST_CONTENT_ERROR_RATE:
        logger.info(f"Room {room_id}: 콘텐츠 파싱 오류 시뮬레이션 발생")
        chunk_text = "invalid_json_string"
      
      try:
        chunk_data = json.loads(chunk_text)
        
        # 완료 메시지인 경우
        if "done" in chunk_data and chunk_data["done"]:
          await ChatService._handle_completion(room_id, current_answer, model, user_message_id, answer_id)
          return current_answer
        
        # 텍스트 응답 처리
        if "message" in chunk_data and "content" in chunk_data["message"]:
          delta = chunk_data["message"]["content"]
          current_answer += delta
          pubsub_client.set(f"{ANSWER_KEY_PREFIX}{room_id}", current_answer, MESSAGE_EXPIRE_TIME)
          await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", json.dumps({
            "delta": delta,
            "full": current_answer,
            "model": model,
            "created_at": datetime.now().isoformat(),
            "user_message_id": user_message_id
          }))
      except json.JSONDecodeError as e:
        error_counter += 1
        logger.warning(f"Room {room_id}: JSON 파싱 오류 - {chunk_text} (오류 횟수: {error_counter})")
        
        # 오류 메시지는 항상 클라이언트에 전송
        await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", json.dumps({
          "error": True,
          "error_type": ERROR_TYPE_CONTENT,
          "message": "답변 도중 오류가 발생했습니다.",
          "model": model,
          "created_at": datetime.now().isoformat(),
          "user_message_id": user_message_id
        }))
        
        # 중복 DB 저장 방지: 첫 오류 발생 시에만 DB에 저장
        if answer_id == "":
          await ChatService._save_error_to_db(room_id, ERROR_TYPE_CONTENT, "답변 도중 오류가 발생했습니다.", model, user_message_id)
        else:
          await ChatService._update_error_to_db(room_id, ERROR_TYPE_CONTENT, "답변 도중 오류가 발생했습니다.", model, user_message_id)
        continue
    
    return current_answer

  @staticmethod
  async def _handle_cancellation_during_streaming(room_id: str, full_answer: str, user_message_id: str = None):
    """응답 스트리밍 중 취소 처리"""
    logger.info(f"Room {room_id}: 응답 생성 중 취소됨")
    
    # 강제 취소인지 확인
    is_force_stopped = room_id in force_stopped_chats and force_stopped_chats[room_id]
    
    if is_force_stopped:
      # 강제 취소 처리
      await ChatService._handle_force_stop(room_id)
      return
    
    # 취소 시 저장 여부 결정
    is_valid = await ChatService.is_valid_answer_for_storage(full_answer)
    
    if not is_valid:
      # 유효하지 않은 답변 처리
      message = ChatService._get_invalid_answer_message(full_answer)
      logger.info(f"Room {room_id}: 유효하지 않은 답변으로 저장하지 않음 ({len(full_answer)} 자)")
      
      # 취소 메시지 발행 (저장 없음)
      await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", json.dumps({
        "cancelled": True,
        "message": message,
        "partial_saved": False
      }))
    else:
      # 유효한 답변 처리
      logger.info(f"Room {room_id}: 응답 생성 중 취소 - 저장은 cancel_chat에서 처리 ({len(full_answer)} 자)")
      
      # 인메모리에 데이터 업데이트
      pubsub_client.set(f"{ANSWER_KEY_PREFIX}{room_id}", full_answer, MESSAGE_EXPIRE_TIME)
      
      # 취소 메시지 발행
      await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", json.dumps({
        "cancelled": True,
        "message": "응답 생성이 취소되었습니다. 지금까지 생성된 답변이 저장되었습니다.",
        "partial_saved": True,
        "partial_length": len(full_answer)
      }))

  @staticmethod
  async def _handle_completion(room_id: str, full_answer: str, model: str, user_message_id: str = None, answer_id: str = ""):
    """응답 완료 처리"""
    # 완료 상태 기록
    completed_chats[room_id] = True
    
    # user_message_id가 없는 경우 메타데이터에서 가져오기
    if not user_message_id:
      metadata = await ChatService.get_metadata(room_id)
      if metadata and "user_message_id" in metadata:
        user_message_id = metadata.get("user_message_id")
    
    # 일반 답변 or 답변이 없는 경우
    if answer_id == "":
      assistant_message = ChatAssistantMessageType(
        room_id=room_id,
        content=full_answer,
        model=model,
        user_message_id=user_message_id,
        error_type=None,
        error_message=None
      )
      result = await ChatService.save_assistant_message(None, assistant_message, commit=True)
    
    # 답변 재시도
    else:
      assistant_update_message = ChatAssistantUpdateMessageType(
        room_id=room_id,
        content=full_answer,
        model=model,
        user_message_id=user_message_id,
        answer_id=answer_id,
      )
      result = await ChatService.update_assistant_message(None, assistant_update_message, commit=True)
    
    # 최종 답변 sse 전송
    if result:
      await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", json.dumps({
          "full": full_answer,
          "model": model,
          "user_message_id": user_message_id,
          "assistant_message_id": result.id,
          "created_at": datetime.now().isoformat(),
          "done": True
        }))
      logger.info(f"Room {room_id}: Ollama API 응답 처리 완료")

      # 응답 완료 후 캐시 및 상태 정리
      pubsub_client.delete(f"{ANSWER_KEY_PREFIX}{room_id}")
      if room_id in cancelled_chats:
        del cancelled_chats[room_id]
      if room_id in force_stopped_chats:
        del force_stopped_chats[room_id]

  @staticmethod
  async def _handle_api_error_response(room_id: str, response, user_message_id: str = None, answer_id: str = ""):
    """API 오류 응답 처리"""
    error_text = await response.text()
    logger.error(f"Room {room_id}: Ollama API 오류 - {response.status}, {error_text}")
    
    error_message = f"API 오류 ({response.status}): {error_text}"
    
    # 메타데이터에서 모델 정보 가져오기
    metadata = await ChatService.get_metadata(room_id)
    model = metadata.get("model", "unknown") if metadata else "unknown"
    
    # user_message_id가 없는 경우 메타데이터에서 가져오기
    if not user_message_id and metadata and "user_message_id" in metadata:
      user_message_id = metadata.get("user_message_id")
    
    error_message = json.dumps({
      "error": True,
      "error_type": ERROR_TYPE_MODEL,
      "message": error_message,
      "model": model,
      "created_at": datetime.now().isoformat()
    })
    await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", error_message)
    
    # 오류 정보 DB에 저장
    if answer_id == "":
      await ChatService._save_error_to_db(room_id, ERROR_TYPE_MODEL, error_message, model, user_message_id)
    else:
      await ChatService._update_error_to_db(room_id, ERROR_TYPE_MODEL, error_message, model, user_message_id)
      
  @staticmethod
  async def _handle_retry(room_id: str, current_retry: int, error_type: str, error_detail: str = "", user_message_id: str = None, answer_id: str = ""):
    """재시도 처리 로직"""
    if current_retry < MAX_RETRIES:
      retry_num = current_retry + 1
      logger.info(f"Room {room_id}: {error_type} 오류 재시도 ({retry_num} / {MAX_RETRIES})")
      
      # 재시도 메시지 결정
      if error_type == ERROR_TYPE_NETWORK:
        message = f"네트워크 오류, 재시도 중입니다 ({retry_num} / {MAX_RETRIES})"
      elif error_type == ERROR_TYPE_TIMEOUT:
        message = f"요청 시간 초과, 재시도 중입니다 ({retry_num} / {MAX_RETRIES})"
      else:
        message = f"오류 발생, 재시도 중입니다 ({retry_num} / {MAX_RETRIES})"
      
      # 재시도 알림 전송
      await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", json.dumps({
        "warning": True,
        "message": message
      }))
      
      # 잠시 대기 후 재시도
      await asyncio.sleep(1)
      return True
    else:
      # 최대 재시도 횟수 초과 시 오류 메시지
      if error_type == ERROR_TYPE_NETWORK:
        message = "네트워크 오류, 네트워크 연결 또는 Ollama 연결을 확인해주세요."
      elif error_type == ERROR_TYPE_TIMEOUT:
        message = "요청 시간이 초과되었습니다. 나중에 다시 시도해주세요."
      else:
        message = f"오류 발생, {error_detail}"
      
      # 메타데이터에서 모델 정보 가져오기
      metadata = await ChatService.get_metadata(room_id)
      model = metadata.get("model", "unknown") if metadata else "unknown"
      
      # user_message_id가 없는 경우 메타데이터에서 가져오기
      if not user_message_id and metadata and "user_message_id" in metadata:
        user_message_id = metadata.get("user_message_id")
    
      error_message = json.dumps({
        "error": True,
        "error_type": error_type,
        "message": message,
        "model": model,
        "created_at": datetime.now().isoformat(),
        "user_message_id": user_message_id
      })
      await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", error_message)
      
      # 오류 정보 DB에 저장
      if answer_id == "":
        await ChatService._save_error_to_db(room_id, error_type, message, model, user_message_id)
      else:
        await ChatService._update_error_to_db(room_id, error_type, message, model, user_message_id)
      
      return False

  @staticmethod
  async def _handle_general_exception(room_id: str, full_answer: str, exception: Exception, model: str, user_message_id: str = None, answer_id: str = ""):
    """일반 예외 처리"""
    logger.error(f"Room {room_id}: 답변 생성 중 오류 발생 - {str(exception)}")
    logger.error(traceback.format_exc())
    
    # 오류 메시지
    error_message = f"오류가 발생했습니다: {str(exception)}"
    
    # 오류 유형 추정
    error_type = ChatService._determine_error_type(str(exception))
    
    # 생성된 답변이 있을 경우 저장 (오류 발생 시에도)
    if full_answer and len(full_answer) >= 10:
      logger.info(f"Room {room_id}: 오류 발생했지만 생성된 답변 있음 ({len(full_answer)} 자) - 인메모리에 저장")
      # 인메모리에 저장 - cancel_chat 함수에서 처리하도록
      pubsub_client.set(f"{ANSWER_KEY_PREFIX}{room_id}", full_answer, MESSAGE_EXPIRE_TIME)
    
    # 메타데이터에서 모델 정보 가져오기
    metadata = await ChatService.get_metadata(room_id)
    model = metadata.get("model", "unknown") if metadata else "unknown"
    
    # 오류 메시지 발행
    await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", json.dumps({
      "error": True,
      "error_type": error_type,
      "message": error_message,
      "model": model,
      "created_at": datetime.now().isoformat()
    }))
    
    # user_message_id가 없는 경우 메타데이터에서 가져오기
    if not user_message_id and metadata and "user_message_id" in metadata:
      user_message_id = metadata.get("user_message_id")
    
    if answer_id == "":
      await ChatService._save_error_to_db(room_id, error_type, error_message, model, user_message_id)
    else:
      await ChatService._update_error_to_db(room_id, error_type, error_message, model, user_message_id)

  @staticmethod
  def _determine_error_type(error_str: str):
    """오류 유형 추정"""
    error_str = error_str.lower()
    if "network" in error_str or "connect" in error_str:
      return ERROR_TYPE_NETWORK
    elif "timeout" in error_str or "시간 초과" in error_str:
      return ERROR_TYPE_TIMEOUT
    elif "model" in error_str or "load" in error_str:
      return ERROR_TYPE_MODEL
    return ERROR_TYPE_UNKNOWN

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
      
    if "<think>" in answer and "</think>" not in answer:
      return False
    
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
      user_message_id = cached_metadata.get("user_message_id", None) if cached_metadata else None
      
      # 부분 답변 DB 저장
      assistant_message = ChatAssistantMessageType(
        room_id=room_id,
        content=cached_answer,
        model=model,
        user_message_id=user_message_id,
        error_type=None,
        error_message=None
      )
      
      # 답변 저장 작업 실행 (비동기 태스크 사용하지 않고 즉시 실행)
      try:
        db = SessionLocal()
        result = await ChatService.save_assistant_message(db, assistant_message, commit=True)
        
        # 저장 성공 시 로그
        logger.info(f"Room {room_id}: 답변 DB 저장 성공 (길이: {len(cached_answer)})")
        
        # 완료 상태로 표시 (부분 답변이지만 저장이 완료됨)
        completed_chats[room_id] = True
        
        # 취소 메시지에 저장 성공 정보 추가
        await pubsub_client.publish(f"{CHAT_CHANNEL_PREFIX}{room_id}", json.dumps({
          "cancelled": True,
          "message": "응답 생성이 취소되었습니다. 지금까지 생성된 답변이 저장되었습니다.",
          "partial_saved": True,
          "partial_length": len(cached_answer),
          "assistant_message_id": result.id,
          "user_message_id": user_message_id,
          "created_at": datetime.now().isoformat()
        }))
      except Exception as e:
        logger.error(f"Room {room_id}: 취소 중 부분 답변 저장 실패 - {str(e)}")
        is_valid = False
      finally:
        db.close()
  
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
    
    # 1초 후 취소 상태 자동 정리 (새로운 요청 허용을 위함)
    asyncio.create_task(ChatService._clear_cancel_and_force_stop_state(room_id, 1))
    
    return is_active
    
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
    
    # 1초 후 취소 상태 자동 정리
    asyncio.create_task(ChatService._clear_cancel_and_force_stop_state(room_id, 1))
    
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
    
    # 오류 카운터 삭제
    error_counter_key = f"{ERROR_COUNTER_PREFIX}{room_id}"
    pubsub_client.delete(error_counter_key)
    
    logger.info(f"Room {room_id}: 취소 및 강제 취소 상태 초기화 완료")

  @staticmethod
  async def _save_error_to_db(room_id: str, error_type: str, error_message: str, model: str, user_message_id: str = None):
    """오류 정보를 데이터베이스에 저장"""
    logger.info(f"Room {room_id}: 오류 정보 저장 시작 (error_type: {error_type})")
    try:
      db = SessionLocal()
      error_assistant_message = ChatAssistantMessageType(
        room_id=room_id,
        content="",  # 빈 문자열로 설정
        model=model,
        user_message_id=user_message_id,
        error_type=error_type,
        error_message=error_message
      )
      
      await ChatService.save_assistant_message(db, error_assistant_message, commit=True)
      logger.info(f"Room {room_id}: 오류 정보 DB 저장 성공 (error_type: {error_type})")
    except Exception as e:
      logger.error(f"Room {room_id}: 오류 정보 저장 실패 - {str(e)}")
    finally:
      if 'db' in locals():
        db.close()
        
  @staticmethod
  async def _update_error_to_db(room_id: str, error_type: str, error_message: str, model: str, user_message_id: str = None):
    """오류 정보를 데이터베이스에 업데이트"""
    logger.info(f"Room {room_id}: 오류 정보 업데이트 시작 (error_type: {error_type})")
    try:
      db = SessionLocal()
      error_assistant_message = ChatAssistantMessageType(
        room_id=room_id,
        content="",  # 빈 문자열로 설정
        model=model,
        user_message_id=user_message_id,
        error_type=error_type,
        error_message=error_message
      )
      
      await ChatService.update_assistant_message(db, error_assistant_message, commit=True)
      logger.info(f"Room {room_id}: 오류 정보 DB 업데이트 성공 (error_type: {error_type})")
    except Exception as e:
      logger.error(f"Room {room_id}: 오류 정보 업데이트 실패 - {str(e)}")
    finally:
      if 'db' in locals():
        db.close()

  @staticmethod
  async def retry_answer(db: Session, room_id: str, user_message_id: str = "", answer_id: str = "", is_error_retry: bool = False):
    """답변 재시도"""
    try:
      # 새 세션 생성 여부 확인
      new_session = False
      if db is None:
        db = SessionLocal()
        new_session = True
        
      # 답변 메시지 조회 (답변 ID가 없을 경우)
      if answer_id == "":
        logger.info(f"Room {room_id}: 답변 ID가 없으므로 질문 ID로 조회")
        answer_message = ChatCrud.get_assistant_message_by_user_message_id(db, user_message_id)
        answer_id = answer_message.id if answer_message else ""
      
      # 질문 메시지 조회
      if user_message_id == "":
        logger.info(f"Room {room_id}: 질문 ID가 없으므로 채팅 내역에서 조회")
        user_message = ChatCrud.get_user_last_message_by_room_id(db, room_id)
      else:
        user_message = ChatCrud.get_user_message_by_id(db, user_message_id)
        
      if not user_message:
        logger.error(f"재시도 실패: 질문 메시지를 찾을 수 없습니다 - {user_message_id}")
        return False, "질문 메시지를 찾을 수 없습니다.", 404
      
      model = user_message.model
      content = user_message.content or ""

      ollama_request = {
        "model": model,
        "messages": [
          { "role": "user", "content": content }
        ] 
      }

      # 이미지가 있는 경우
      if user_message.images:
        images = [item["data"] for item in user_message.images]
        ollama_request["messages"][0]["images"] = images
        if not content:
          content = "Please interpret the images"

      logger.info(f"답변 재시도 시작 (model: {model}, question: {content})")
      logger.debug(f"Room {room_id}: retry_answer – 새 태스크 생성 후 generate_ollama_answer 호출")
      asyncio.create_task(ChatService.generate_ollama_answer(room_id, ollama_request, user_message.id, answer_id))  
      return True, "답변 재시도 시작", 200
    except Exception as e:
      logger.error(f"Room {room_id}: 답변 재시도 중 오류 발생: {str(e)}")
      return False, f"오류가 발생했습니다: {str(e)}", 500
    finally:
      if new_session:
        db.close()

  @staticmethod
  def _reset_room_state(room_id: str):
    """재시도 시작 전 기존 상태를 정리하여 응답/재시도 데이터가 섞이는 것을 방지"""
    # 완료/취소 플래그 초기화
    cancelled_chats.pop(room_id, None)
    force_stopped_chats.pop(room_id, None)
    completed_chats.pop(room_id, None)

    # 인메모리 캐시(답변/오류 카운터) 삭제
    pubsub_client.delete(f"{ANSWER_KEY_PREFIX}{room_id}")
    pubsub_client.delete(f"{ERROR_COUNTER_PREFIX}{room_id}")

    # 채널 큐 클리어하여 이전 세션의 미전송 메시지 제거
    try:
      pubsub_client.clear_channel(f"{CHAT_CHANNEL_PREFIX}{room_id}")
    except Exception:
      # clear_channel은 구현체에 따라 없을 수 있으므로 예외 무시
      pass