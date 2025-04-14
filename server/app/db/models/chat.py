import uuid
from sqlalchemy import JSON, Column, String, Text, ForeignKey, DateTime, event
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.utils.datetime_utils import get_kst_time

## 채팅 메시지 테이블  
class ChatMessage(Base):
  __tablename__ = "messages"

  id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))  # 메시지 고유 ID
  room_id = Column(String, ForeignKey("rooms.id"), nullable=False)  # 연결된 채팅방의 ID
  role = Column(String, nullable=False)  # "user" 또는 "assistant"
  model = Column(String, nullable=False)  # 모델 이름
  content = Column(Text, nullable=False)  # 마크다운 텍스트 (길어질 수 있음)
  images = Column(JSON, nullable=True)  # base64 인코딩된 이미지 문자열 리스트, 없을 수도 있음
  created_at = Column(DateTime(timezone=True), default=get_kst_time)  # 생성 시각
  updated_at = Column(DateTime(timezone=True), default=get_kst_time)  # 수정 시각

  room = relationship("Room", back_populates="messages")
  # options = relationship("MessageOption", back_populates="message", cascade="all, delete-orphan")

# updated_at 자동 업데이트를 위한 이벤트 리스너
@event.listens_for(ChatMessage, 'before_update')
def update_updated_at(_mapper, _connection, target):
  target.updated_at = get_kst_time()