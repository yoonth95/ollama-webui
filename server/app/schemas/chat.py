from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from app.schemas.base import TimeModelMixin
 
class ImageData(BaseModel):
  id: str
  data: str
  mime_type: str 

class ChatUserMessageType(BaseModel):
  """채팅 유저 메시지 타입"""
  room_id: str
  content: str
  model: str
  images: Optional[List[ImageData]] = None

class ChatAssistantMessageType(BaseModel):
  """채팅 어시스턴트 메시지 타입"""
  room_id: str
  content: str
  model: str

class ChatHistoryResponseType(TimeModelMixin):
  """채팅 내역 응답 타입"""
  id: str
  room_id: str
  role: str
  model: str
  content: str
  images: Optional[List[ImageData]] = None
  created_at: datetime
  updated_at: datetime

  model_config = {
    "from_attributes": True
  }

class ChatRetryRequestType(BaseModel):
  """채팅 재시도 요청 타입"""
  room_id: str

class ChatCancelRequestType(BaseModel):
  """채팅 중단 요청 타입"""
  room_id: str

class ChatForceStopRequestType(BaseModel):
  """채팅 강제 취소 요청 타입"""
  room_id: str

