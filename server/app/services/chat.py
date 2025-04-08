import json
from sqlalchemy.orm import Session
from app.schemas.chat import ChatUserMessageType
from app.db.crud.chat import ChatCrud

class ChatService:
  @staticmethod
  async def send_user_message(db: Session, user_message: ChatUserMessageType, commit: bool = True):
    """유저 메시지 저장"""
    ChatCrud.send_user_message(db, user_message, commit=commit)
    