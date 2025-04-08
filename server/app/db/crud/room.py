from sqlalchemy.orm import Session
from app.db.models.room import Room
from app.schemas.room import RoomTitle

class RoomCrud:
  @staticmethod
  def create_new_room(db: Session, chat_room_data: RoomTitle, commit: bool = True):
    """채팅방 생성"""
    new_room = Room(title=chat_room_data.title)
    db.add(new_room)
    
    if commit:
      db.commit()
      db.refresh(new_room)
      
    return new_room

  @staticmethod
  def get_rooms(db: Session, page: int, limit: int):
    """채팅방 목록 조회(페이지네이션) - 보관되지 않은 채팅방만"""
    offset = (page - 1) * limit
    
    total_items = db.query(Room).filter(Room.is_archived == False).count()
    
    total_pages = (total_items + limit - 1) // limit
    
    items = (
      db.query(Room)
      .filter(Room.is_archived == False)
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
    """채팅방 삭제"""
    room = db.query(Room).filter(Room.id == room_id).first()
    if room:
      db.delete(room)
      db.commit()
      return True
    return False
  
  @staticmethod
  def update_room_title(db: Session, room_id: str, new_title: str):
    """채팅방 제목 수정"""
    room = db.query(Room).filter(Room.id == room_id).first()
    if room:
      room.title = new_title
      db.commit()
      return True
    return False