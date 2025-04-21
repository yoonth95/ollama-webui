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
  user_message_id: str
  error_type: Optional[str] = None
  error_message: Optional[str] = None
  
class ChatAssistantUpdateMessageType(BaseModel):
  """채팅 어시스턴트 메시지 수정 타입"""
  room_id: str
  content: str
  model: str
  user_message_id: str
  answer_id: str

class ChatHistoryResponseType(TimeModelMixin):
  """채팅 내역 응답 타입"""
  id: str
  room_id: str
  role: str
  model: str
  content: str
  images: Optional[List[ImageData]] = None
  error_type: Optional[str] = None
  error_message: Optional[str] = None
  user_message_id: Optional[str] = None
  created_at: datetime
  updated_at: datetime

  model_config = {
    "from_attributes": True
  }

class ChatRetryRequestType(BaseModel):
  """채팅 재시도 요청 타입"""
  room_id: str
  user_message_id: Optional[str] = None
  answer_id: Optional[str] = None
  is_error_retry: Optional[bool] = False

class ChatCancelRequestType(BaseModel):
  """채팅 중단 요청 타입"""
  room_id: str

class ChatForceStopRequestType(BaseModel):
  """채팅 강제 취소 요청 타입"""
  room_id: str

