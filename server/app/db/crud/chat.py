from sqlalchemy.orm import Session
from app.db.models.chat import ChatMessage
from app.schemas.chat import ChatUserMessageType

class ChatCrud:
  @staticmethod
  def save_user_message(db: Session, user_message: ChatUserMessageType, commit: bool = True):
    """유저 메시지 저장"""
    message_data = {
      "room_id": user_message.room_id,
      "role": "user",
      "model": user_message.model,
      "content": user_message.content
    }
    
    if user_message.images is not None:
      message_data["images"] = user_message.images
    
    new_message = ChatMessage(**message_data)
    db.add(new_message)
    
    if commit:
      db.commit()
      db.refresh(new_message)
      
    return new_message

  @staticmethod
  def get_chatting_history(db: Session, room_id: str):
    """채팅방 조회"""
    
    return (
      db.query(ChatMessage)
      .filter(ChatMessage.room_id == room_id)
      .order_by(ChatMessage.created_at.desc())
      .all()
    )

