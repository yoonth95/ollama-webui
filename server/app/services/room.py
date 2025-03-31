import json
from sqlalchemy.orm import Session
from typing import List
from app.schemas.room import RoomResponse, RoomCreate
from app.db.crud.room import RoomCrud
from app.schemas.room import RoomRenameRequest

class RoomService:
  @staticmethod
  async def create_room_service(db: Session) -> RoomResponse:
    # "새 채팅"으로 기본 채팅방 생성
    new_room = RoomCrud.create_new_room(db, RoomCreate(title="새 채팅"))
    
    response = RoomResponse(
      id=new_room.id,
      title=new_room.title,
      created_at=new_room.created_at
    )
    
    return json.loads(response.model_dump_json())
  
  @staticmethod
  async def get_rooms_service(db: Session, page: int, limit: int) -> List[dict]:
    result = RoomCrud.get_rooms(db, page, limit)
    return {
      "items": [RoomResponse.model_validate(room).model_dump() for room in result["items"]],
      "meta": result["meta"]
    }
  
  @staticmethod
  async def delete_room_service(db: Session, room_id: str) -> bool:
    return RoomCrud.delete_room(db, room_id)
    
  @staticmethod
  async def update_room_title_service(db: Session, room_id: str, new_title: str) -> bool:
    return RoomCrud.update_room_title(db, room_id, new_title)