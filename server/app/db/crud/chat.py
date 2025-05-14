import uuid
from sqlalchemy.orm import Session
from app.db.models.chat import ChatMessage
from app.schemas.chat import ChatUserMessageType, ChatAssistantMessageType, ChatAssistantUpdateMessageType

class ChatCrud:
  @staticmethod
  def save_user_message(db: Session, user_message: ChatUserMessageType, commit: bool = True):
    """유저 메시지 저장"""
    chat = ChatMessage(
      id=str(uuid.uuid4()),
      room_id=user_message.room_id,
      role="user",
      model=user_message.model,
      content=user_message.content,
    )
    if user_message.images:
      chat.images = [img.model_dump() for img in user_message.images]
    
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
      error_type=assistant_message.error_type,
      error_message=assistant_message.error_message,
      user_message_id=assistant_message.user_message_id
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

  @staticmethod
  def get_user_message_by_id(db: Session, message_id: str):
    """메시지 ID로 유저 메시지 조회"""
    return db.query(ChatMessage).filter(
      ChatMessage.id == message_id,
      ChatMessage.role == "user"
    ).first()
    
  @staticmethod
  def get_assistant_message_by_id(db: Session, message_id: str):
    """메시지 ID로 어시스턴트 메시지 조회"""
    return db.query(ChatMessage).filter(
      ChatMessage.id == message_id,
      ChatMessage.role == "assistant"
    ).first()
    
  @staticmethod
  def get_assistant_message_by_user_message_id(db: Session, user_message_id: str):
    """유저 메시지 ID로 어시스턴트 메시지 조회"""
    return db.query(ChatMessage).filter(
      ChatMessage.user_message_id == user_message_id,
      ChatMessage.role == "assistant"
    ).first()
  
  @staticmethod
  def get_user_last_message_by_room_id(db: Session, room_id: str):
    """채팅 내역에서 마지막 유저 메시지 조회"""
    return db.query(ChatMessage).filter(
      ChatMessage.room_id == room_id,
      ChatMessage.role == "user"
    ).order_by(ChatMessage.created_at.desc()).first()
    
  @staticmethod
  def update_assistant_message(db: Session, assistant_update_message: ChatAssistantUpdateMessageType, commit: bool = True):
    """어시스턴트 메시지 업데이트"""
    message = db.query(ChatMessage).filter(
      ChatMessage.id == assistant_update_message.answer_id,
      ChatMessage.role == "assistant"
    ).first()
    
    if not message:
      return False
      
    message.content = assistant_update_message.content
    message.error_type = assistant_update_message.error_type
    message.error_message = assistant_update_message.error_message
    
    if commit:
      db.commit()
      db.refresh(message)
      
    return message

