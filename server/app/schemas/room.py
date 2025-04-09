from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from app.schemas.base import TimeModelMixin
from app.schemas.chat import ImageData

class RoomCreateRequest(BaseModel):
  model: str
  content: str
  images: Optional[List[ImageData]] = None
  
class RoomRenameRequest(BaseModel):
  room_id: str
  new_title: str
  
class RoomTitle(BaseModel):
  title: str

class RoomResponse(TimeModelMixin):
  id: str
  title: str
  is_archived: bool
  created_at: datetime
  updated_at: datetime
  
  model_config = {
    "from_attributes": True
  }

class PaginationMeta(BaseModel):
  current_page: int
  total_pages: int
  has_next_page: bool
  total_items: int

class RoomListResponse(BaseModel):
  items: List[RoomResponse]
  meta: PaginationMeta
  