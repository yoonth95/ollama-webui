from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from app.schemas.base import TimeModelMixin
  
class ChatUserMessageType(BaseModel):
  room_id: str
  model: str
  content: str
  images: Optional[List[str]] = None

class ChatHistoryResponseType(TimeModelMixin):
  id: str
  room_id: str
  role: str
  model: str
  content: str
  images: Optional[List[str]] = None
  created_at: datetime
  updated_at: datetime

  model_config = {
    "from_attributes": True
  }