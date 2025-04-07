from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class RoomCreateRequest(BaseModel):
  model: str
  content: str
  images: Optional[List[str]] = None
  
class RoomRenameRequest(BaseModel):
  room_id: str
  new_title: str
  
class RoomTitle(BaseModel):
  title: str

class RoomResponse(BaseModel):
  id: str
  title: str
  is_archived: bool
  created_at: datetime
  updated_at: datetime
  
  model_config = {
    "from_attributes": True
  }
  
  def model_dump(self, **kwargs):
    dump = super().model_dump(**kwargs)
    if isinstance(self.created_at, datetime):
      dump['created_at'] = self.created_at.isoformat()
    if isinstance(self.updated_at, datetime):
      dump['updated_at'] = self.updated_at.isoformat()
    return dump

class PaginationMeta(BaseModel):
  current_page: int
  total_pages: int
  has_next_page: bool
  total_items: int

class RoomListResponse(BaseModel):
  items: List[RoomResponse]
  meta: PaginationMeta
  