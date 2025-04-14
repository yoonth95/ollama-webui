import uuid
from sqlalchemy import Column, String, DateTime, Boolean, event
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.utils.datetime_utils import get_kst_time

## 채팅방 테이블
class Room(Base):
  __tablename__ = "rooms"

  id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))  # 채팅방 고유 ID
  title = Column(String, nullable=False)  # 채팅방 제목
  is_archived = Column(Boolean, default=False)  # 보관 여부
  created_at = Column(DateTime(timezone=True), default=get_kst_time)  # 생성일
  updated_at = Column(DateTime(timezone=True), default=get_kst_time)  # 수정일

  messages = relationship("ChatMessage", back_populates="room", cascade="all, delete-orphan")  # 메시지 관계 (1:N)

# updated_at 자동 업데이트를 위한 이벤트 리스너
@event.listens_for(Room, 'before_update')
def update_updated_at(_mapper, _connection, target):
  target.updated_at = get_kst_time()
