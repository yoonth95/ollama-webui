from sqlalchemy.orm import Session
from app.schemas.chat import ChatUserMessageType, ChatHistoryResponseType
from app.db.crud.chat import ChatCrud

class ChatService:
  @staticmethod
  async def save_user_message(db: Session, user_message: ChatUserMessageType, commit: bool = True):
    """유저 메시지 저장"""
    ChatCrud.save_user_message(db, user_message, commit=commit)
    
  @staticmethod
  async def get_chatting_history(db: Session, room_id: str):
    """채팅방 조회"""
    result = ChatCrud.get_chatting_history(db, room_id)
    
    if not result:
      return False
    
    return [ChatHistoryResponseType.model_validate(message).model_dump() for message in result]

