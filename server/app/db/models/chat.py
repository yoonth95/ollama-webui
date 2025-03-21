from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.utils.datetime_utils import get_kst_time

## 채팅 메시지 테이블
class ChatMessage(Base):
  __tablename__ = "chat_messages"

  id = Column(Integer, primary_key=True, autoincrement=True)
  room_id = Column(String, ForeignKey("rooms.id"), nullable=False)  # 채팅방 ID
  role = Column(String, nullable=False)  # "user" 또는 "assistant"
  content = Column(Text, nullable=False)  # 채팅 메시지 내용
  created_at = Column(DateTime(timezone=True), default=get_kst_time)  # 생성일

  room = relationship("Room", back_populates="messages")
