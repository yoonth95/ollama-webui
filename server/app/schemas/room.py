from pydantic import BaseModel
from datetime import datetime
from typing import List

class ChatRequest(BaseModel):
  model: str
  message: str
  
class RoomCreate(BaseModel):
  title: str

class RoomResponse(BaseModel):
  id: str
  title: str
  created_at: datetime
  
  model_config = {
    "from_attributes": True
  }
  
  def model_dump(self, **kwargs):
    dump = super().model_dump(**kwargs)
    if isinstance(self.created_at, datetime):
      dump['created_at'] = self.created_at.isoformat()
    return dump

class ChatRoomList(BaseModel):
  chat_rooms: List[RoomResponse]
    
class RoomRenameRequest(BaseModel):
  room_id: str
  new_title: str