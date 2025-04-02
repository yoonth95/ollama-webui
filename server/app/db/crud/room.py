from sqlalchemy.orm import Session
from app.db.models.room import Room
from app.schemas.room import RoomTitle

class RoomCrud:
  @staticmethod
  def create_new_room(db: Session, chat_room_data: RoomTitle):
    new_room = Room(title=chat_room_data.title)
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return new_room

  @staticmethod
  def get_rooms(db: Session, page: int, limit: int):
    offset = (page - 1) * limit
    
    # 전체 개수 조회
    total_items = db.query(Room).count()
    
    # 전체 페이지 수 계산
    total_pages = (total_items + limit - 1) // limit
    
    # 항목 조회
    items = (
      db.query(Room)
      .order_by(Room.created_at.desc())
      .offset(offset)
      .limit(limit)
      .all()
    )
    
    return {
      "items": items,
      "meta": {
        "current_page": page,
        "total_pages": total_pages,
        "has_next_page": page < total_pages,
        "total_items": total_items
      }
    }

  @staticmethod
  def delete_room(db: Session, room_id: str):
    room = db.query(Room).filter(Room.id == room_id).first()
    if room:
      db.delete(room)
      db.commit()
      return True
    return False
  
  @staticmethod
  def update_room_title(db: Session, room_id: str, new_title: str):
    room = db.query(Room).filter(Room.id == room_id).first()
    if room:
      room.title = new_title
      db.commit()
      return True
    return False