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
    else:
      db.flush()
      db.refresh(new_room)
      
    return new_room

  @staticmethod
  def _get_rooms_by_archive_status(db: Session, page: int, limit: int, is_archived: bool):
    """채팅방 목록 조회 공통 로직 (페이지네이션)"""
    offset = (page - 1) * limit
    
    total_items = db.query(Room).filter(Room.is_archived == is_archived).count()
    
    total_pages = (total_items + limit - 1) // limit
    
    items = (
      db.query(Room)
      .filter(Room.is_archived == is_archived)
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
  def get_room(db: Session, room_id: str):
    """채팅방 조회"""
    return db.query(Room).filter(Room.id == room_id).first()

  @staticmethod
  def get_rooms(db: Session, page: int, limit: int):
    """채팅방 목록 조회(페이지네이션) - 보관되지 않은 채팅방만"""
    return RoomCrud._get_rooms_by_archive_status(db, page, limit, is_archived=False)

  @staticmethod
  def get_archived_rooms(db: Session, page: int, limit: int):
    """보관된 채팅방 목록 조회(페이지네이션)"""
    return RoomCrud._get_rooms_by_archive_status(db, page, limit, is_archived=True)

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
  def delete_all_rooms(db: Session):
    """모든 채팅방 삭제"""
    db.query(Room).delete()
    db.commit()
    return True
  
  @staticmethod
  def update_room_title(db: Session, room_id: str, new_title: str):
    """채팅방 제목 수정"""
    room = db.query(Room).filter(Room.id == room_id).first()
    if room:
      room.title = new_title
      db.commit()
      return True
    return False

  @staticmethod
  def archive_room(db: Session, room_id: str):
    """채팅방 보관"""
    room = db.query(Room).filter(Room.id == room_id).first()
    if room:
      room.is_archived = True
      db.commit()
      return True
    return False

  @staticmethod
  def unarchive_room(db: Session, room_id: str):
    """채팅방 복구"""
    room = db.query(Room).filter(Room.id == room_id).first()
    if room:
      room.is_archived = False
      db.commit()
      return True
    return False

  @staticmethod
  def archive_all_rooms(db: Session):
    """모든 채팅방 보관"""
    db.query(Room).update({"is_archived": True})
    db.commit()
    return True