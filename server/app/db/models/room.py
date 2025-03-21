import uuid
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.utils.datetime_utils import get_kst_time

## 채팅방 테이블
class Room(Base):
  __tablename__ = "rooms"

  id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))  # 채팅방 고유 ID
  title = Column(String, nullable=False)  # 채팅방 제목
  created_at = Column(DateTime(timezone=True), default=get_kst_time)  # 생성일

  messages = relationship("ChatMessage", back_populates="room", cascade="all, delete-orphan")  # 메시지 관계 (1:N)
