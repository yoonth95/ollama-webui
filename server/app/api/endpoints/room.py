from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.services.room import RoomService
from app.services.chat import ChatService
from app.schemas.room import RoomCreateRequest, RoomRenameRequest
from app.schemas.chat import ChatUserMessageType
from app.utils.response import create_response
from app.utils.handle_exceptions import handle_exceptions
from app.utils.transaction import transactional
from app.db.database import get_db
import logging

router = APIRouter()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

## 채팅방 생성
@router.post("/room/create-room")
@handle_exceptions # 예외 먼저 처리
@transactional     # 이후 트랜잭션 관리
async def create_new_room(request: RoomCreateRequest, db: Session = Depends(get_db)):
  logger.info(f"📩 클라이언트 채팅방 생성")
  
  if not request.content and not request.images:
    return JSONResponse(content=create_response(False, "이미지 첨부 또는 질문을 입력해주세요.", None), status_code=400)

  if not request.model:
    return JSONResponse(content=create_response(False, "모델을 선택해주세요.", None), status_code=400)
  
  # ChatService에서 채팅방 생성 서비스 호출
  response = await RoomService.create_room_service(db)
  
  # 유저 메시지 저장
  data = {
    "room_id": response["id"],
    "content": request.content,
    "model": request.model,
    "images": request.images if request.images else None
  }
  await ChatService.send_user_message(db, ChatUserMessageType(**data))
  
  return JSONResponse(content=create_response(True, "채팅방 생성 완료", response), status_code=200)

## 채팅방 전체 조회
@router.get("/room/get-rooms")
@handle_exceptions
async def get_rooms(page: int = 1, limit: int = 20, db: Session = Depends(get_db)):
  logger.info(f"📩 클라이언트 채팅방 리스트 조회")
  
  response = await RoomService.get_rooms_service(db, page, limit)

  return JSONResponse(content=create_response(True, "채팅방 전체 조회", response), status_code=200)

## 채팅방 ID 넘겨주지 않는 경우
@router.delete("/room/delete-room/")
@handle_exceptions
async def delete_room_no_id():
  return JSONResponse(content=create_response(False, "채팅방을 찾을 수 없습니다.", None), status_code=404)

## 채팅방 삭제
@router.delete("/room/delete-room/{room_id}")
@handle_exceptions
async def delete_room(room_id: str, db: Session = Depends(get_db)):
  logger.info(f"📩 클라이언트 채팅방 삭제")
  
  success = await RoomService.delete_room_service(db, room_id)
  
  if not success:
    return JSONResponse(content=create_response(False, "채팅방을 찾을 수 없습니다.", None), status_code=404)

  return JSONResponse(content=create_response(True, "채팅방 삭제 성공", None), status_code=200)

## 채팅방 이름 변경
@router.patch("/room/update-room-title")
@handle_exceptions
async def update_room_title(request: RoomRenameRequest, db: Session = Depends(get_db)):
  logger.info(f"📩 클라이언트 채팅방 리스트 조회")
  
  room_id = request.room_id
  new_title = request.new_title
  success = await RoomService.update_room_title_service(db, room_id, new_title)
  
  if not success:
    return JSONResponse(content=create_response(False, "채팅방을 찾을 수 없습니다.", None), status_code=404)

  return JSONResponse(content=create_response(True, "채팅방 이름 변경 성공", None), status_code=200)