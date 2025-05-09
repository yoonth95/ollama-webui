import json
import aiohttp
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db.crud.room import RoomCrud
from app.utils.memory_pubsub import memory_pubsub
from app.core.config import settings
from app.schemas.room import RoomResponse, RoomTitle, RoomListResponse
from datetime import datetime

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 인메모리 PubSub 클라이언트
pubsub_client = memory_pubsub

# 상수 정의
ROOM_TITLE_KEY_PREFIX = "room_title:"
ROOM_CHANNEL_PREFIX = "room:"
MESSAGE_EXPIRE_TIME = 60 * 60 * 24  # 24시간

class RoomService:
  @staticmethod
  async def create_room_service(db: Session, commit: bool = True) -> RoomResponse:
    """채팅방 생성"""
    new_room = RoomCrud.create_new_room(db, RoomTitle(title="새 채팅"), commit=commit)
    
    response = RoomResponse(
      id=new_room.id,
      title=new_room.title,
      is_archived=new_room.is_archived,
      created_at=new_room.created_at,
      updated_at=new_room.updated_at
    )
    
    return json.loads(response.model_dump_json())
  
  @staticmethod
  async def get_rooms_service(db: Session, page: int, limit: int) -> RoomListResponse:
    """채팅방 목록 조회"""
    result = RoomCrud.get_rooms(db, page, limit)
    return {
      "items": [RoomResponse.model_validate(room).model_dump() for room in result["items"]],
      "meta": result["meta"]
    }
  
  @staticmethod
  async def delete_room_service(db: Session, room_id: str) -> bool:
    """채팅방 삭제"""
    return RoomCrud.delete_room(db, room_id)
    
  @staticmethod
  async def update_room_title_service(db: Session, room_id: str, new_title: str) -> bool:
    """채팅방 제목 수정"""
    return RoomCrud.update_room_title(db, room_id, new_title)

  @staticmethod
  async def generate_and_update_title(room_id: str, user_message: str, model: str):
    """채팅방 제목 생성 및 업데이트"""
    try:
      # 타이틀 생성
      title = await RoomService._generate_title_ollama(user_message, model)
      
      # DB 업데이트
      db = SessionLocal()
      try:
        success = RoomCrud.update_room_title(db, room_id, title)
        if success:
          # 타이틀 정보를 인메모리에 저장
          title_data = {
            "room_id": room_id,
            "title": title,
            "updated_at": datetime.now().isoformat()
          }
          pubsub_client.set(f"{ROOM_TITLE_KEY_PREFIX}{room_id}", json.dumps(title_data), MESSAGE_EXPIRE_TIME)
          
          # 타이틀 변경 이벤트를 PubSub에 발행
          await pubsub_client.publish(
            f"{ROOM_CHANNEL_PREFIX}{room_id}", 
            json.dumps({
              "event": "title_updated",
              "data": {
                "room_id": room_id,
                "title": title
              }
            })
          )
          logger.info(f"{room_id} 채팅방 타이틀 업데이트 성공: {title}")
        else:
          logger.warning(f"{room_id} 채팅방 타이틀 업데이트 실패")
      finally:
        db.close()
    except Exception as e:
      logger.error(f"{room_id} 채팅방 타이틀 생성 중 오류: {str(e)}")
      
  @staticmethod
  async def _generate_title_ollama(user_message: str, model: str) -> str:
    """채팅방 타이틀 생성"""
    try:
      prompt = """### Task:
        Generate a concise, 3-5 word title with an emoji summarizing the chat history.

        ### Guidelines:
        - The title should clearly reflect the user's main question or topic.
        - Use emojis to visually reinforce the topic, but do not use quotation marks or extra punctuation.
        - Write the title in the same language as the majority of the conversation; if unclear, default to English.
        - Focus on clarity, relevance, and brevity—avoid overly creative or vague titles.
        - If the conversation is primarily a technical question, frame the title to reflect that.

        ### Output:
        JSON format: { "title": "your concise title here" }

        ### Examples:
        - { "title": "📉 Stock Market Trends" }
        - { "title": "🍪 Perfect Chocolate Chip Recipe" }
        - { "title": "Evolution of Music Streaming" }
        - { "title": "Remote Work Productivity Tips" }
        - { "title": "Artificial Intelligence in Healthcare" }
        - { "title": "🎮 Video Game Development Insights" }

        ### Chat History:
      """ + user_message
      
      ollama_request = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "format": {
          "type": "object",
          "properties": {
            "title": { "type": "string" }
          },
          "required": ["title"]
        }
      }

      async with aiohttp.ClientSession() as session:
        url = f"{settings.OLLAMA_API_BASE_URL}/api/generate"
        async with session.post(url, json=ollama_request) as response:
          if response.status == 200:
            data = await response.json()
            title = data.get("response", "").strip()
            title = json.loads(title).get("title", "")
            
            return title if title and len(title.strip()) > 0 else "새 채팅"
          else:
            logger.error(f"채팅방 타이틀 생성 실패 - 응답 실패: {response.status}")
            return "새 채팅"
    except Exception as e:
      logger.error(f"채팅방 타이틀 생성 실패 - 오류: {str(e)}")
      return "새 채팅"