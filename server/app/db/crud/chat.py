from sqlalchemy.orm import Session
from app.db.models.chat import ChatMessage
from app.schemas.chat import ChatUserMessageType, ChatAssistantMessageType

class ChatCrud:
  @staticmethod
  def save_user_message(db: Session, user_message: ChatUserMessageType, commit: bool = True):
    """유저 메시지 저장"""
    chat = ChatMessage(
      room_id=user_message.room_id,
      role="user",
      model=user_message.model,
      content=user_message.content,
      images=user_message.images
    )
    
    db.add(chat)
    
    if commit:
      db.commit()
      db.refresh(chat)
    
    return chat
  
  @staticmethod
  def save_assistant_message(db: Session, assistant_message: ChatAssistantMessageType, commit: bool = True):
    """어시스턴트 메시지 저장"""
    chat = ChatMessage(
      room_id=assistant_message.room_id,
      role="assistant",
      model=assistant_message.model,
      content=assistant_message.content,
    )
    
    db.add(chat)
    
    if commit:
      db.commit()
      db.refresh(chat)
    
    return chat

  @staticmethod
  def get_chatting_history(db: Session, room_id: str):
    """채팅 내역 조회"""
    result = db.query(ChatMessage).filter(ChatMessage.room_id == room_id).order_by(ChatMessage.created_at.asc()).all()
    return result

  @staticmethod
  def delete_assistant_message(db: Session, message_id: str, commit: bool = True):
    """어시스턴트 메시지 삭제"""
    message = db.query(ChatMessage).filter(
      ChatMessage.id == message_id,
      ChatMessage.role == "assistant"
    ).first()
    
    if not message:
      return False
      
    db.delete(message)
    
    if commit:
      db.commit()
      
    return True

