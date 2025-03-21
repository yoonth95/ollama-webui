from sqlalchemy.orm import Session
from app.db.models.room import Room
from app.schemas.room import RoomCreate

class RoomCrud:
  @staticmethod
  def create_new_room(db: Session, chat_room_data: RoomCreate):
    new_room = Room(title=chat_room_data.title)
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return new_room

  @staticmethod
  def get_rooms(db: Session, page: int, limit: int):
    offset = (page - 1) * limit
    return (
      db.query(Room)
      .order_by(Room.created_at.desc())
      .offset(offset)
      .limit(limit)
      .all()
    )

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