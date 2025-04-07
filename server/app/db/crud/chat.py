from sqlalchemy.orm import Session
from app.db.models.chat import ChatMessage
from app.schemas.chat import ChatUserMessageType

class ChatCrud:
  @staticmethod
  def send_user_message(db: Session, user_message: ChatUserMessageType):
    # 기본 메시지 데이터 준비
    message_data = {
      "room_id": user_message.room_id,
      "role": "user",
      "model": user_message.model,
      "content": user_message.content
    }
    
    # images가 있는 경우에만 추가
    if user_message.images is not None:
      message_data["images"] = user_message.images
    
    # 새 메시지 생성
    new_message = ChatMessage(**message_data)
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return new_message
