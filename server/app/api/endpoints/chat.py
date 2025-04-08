from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.services.chat import ChatService
from app.utils.response import create_response
from app.utils.handle_exceptions import handle_exceptions
from app.db.database import get_db
import logging

router = APIRouter()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.get("/chat/{room_id}")
@handle_exceptions
async def get_chatting_history(room_id: str, db: Session = Depends(get_db)):
  """채팅방 조회"""
  logger.info(f"📩 클라이언트 채팅방 조회")
  
  response = await ChatService.get_chatting_history(db, room_id)

  if not response:
    return JSONResponse(content=create_response(False, "존재하지 않는 채팅방입니다.", None), status_code=404)

  return JSONResponse(content=create_response(True, "채팅 내역 조회", response), status_code=200)