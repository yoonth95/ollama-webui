from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.services.room import RoomService
from app.services.chat import ChatService
from app.schemas.room import RoomCreateRequest, RoomRenameRequest
from app.schemas.chat import ChatUserMessageType
from app.utils.response import create_response
from app.utils.handle_exceptions import handle_exceptions
from app.db.database import get_db
from app.core.config import settings
from app.utils.memory_pubsub import memory_pubsub
import asyncio
import logging

router = APIRouter()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 인메모리 PubSub 클라이언트
pubsub_client = memory_pubsub

@router.post("/room/create-room")
@handle_exceptions
async def create_new_room(request: RoomCreateRequest, db: Session = Depends(get_db)):
  """채팅방 생성"""
  logger.info(f"📩 클라이언트 채팅방 생성")
  
  if not request.content and not request.images:
    return JSONResponse(content=create_response(False, "이미지 첨부 또는 질문을 입력해주세요.", None), status_code=400)

  if not request.model:
    return JSONResponse(content=create_response(False, "모델을 선택해주세요.", None), status_code=400)
  
  try:
    db.begin()  # 트랜잭션 시작
    
    # 채팅방 생성 (commit=False로 설정하여 자동 커밋 방지)
    response = await RoomService.create_room_service(db, commit=False)
    
    if not response:
      db.rollback()
      logger.error("채팅방 생성 실패: 빈 응답")
      return JSONResponse(content=create_response(False, "채팅방 생성 실패", None), status_code=500)
    
    user_message = {
      "room_id": response["id"],
      "content": request.content,
      "model": request.model,
    }
    ollama_request = {
      "model": request.model,
      "messages": [
        {
          "role": "user",
          "content": request.content
        }
      ]
    }
    if request.images:
      user_message["images"] = request.images
      ollama_request["messages"][0]["images"] = request.images
    
    # 유저 메시지 저장 (commit=False로 설정하여 자동 커밋 방지)
    await ChatService.save_user_message(db, ChatUserMessageType(**user_message), commit=False)
    
    db.commit() # 커밋
    
    # 백그라운드 태스크로 실행하여 API 응답을 기다리지 않고 바로 반환
    asyncio.create_task(ChatService.generate_ollama_answer(response["id"], ollama_request))
    
    return JSONResponse(content=create_response(True, "채팅방 생성 완료", response), status_code=200)
  
  except Exception as e:
    db.rollback() # 롤백
    logger.error(f"채팅방 생성 중 오류 발생: {e}")
    raise # 예외를 다시 발생시켜 handle_exceptions에서 에러 처리

@router.get("/room/get-rooms")
@handle_exceptions
async def get_rooms(page: int = 1, limit: int = 20, db: Session = Depends(get_db)):
  """채팅방 전체 조회"""
  logger.info(f"📩 클라이언트 채팅방 리스트 조회")
  
  response = await RoomService.get_rooms_service(db, page, limit)

  return JSONResponse(content=create_response(True, "채팅방 전체 조회", response), status_code=200)

@router.delete("/room/delete-room/")
@handle_exceptions
async def delete_room_no_id():
  """채팅방 ID 넘겨주지 않는 경우"""
  return JSONResponse(content=create_response(False, "채팅방을 찾을 수 없습니다.", None), status_code=404)

@router.delete("/room/delete-room/{room_id}")
@handle_exceptions
async def delete_room(room_id: str, db: Session = Depends(get_db)):
  """채팅방 삭제"""
  logger.info(f"📩 클라이언트 채팅방 삭제")
  
  success = await RoomService.delete_room_service(db, room_id)
  
  if not success:
    return JSONResponse(content=create_response(False, "채팅방을 찾을 수 없습니다.", None), status_code=404)

  return JSONResponse(content=create_response(True, "채팅방 삭제 성공", None), status_code=200)

@router.patch("/room/update-room-title")
@handle_exceptions
async def update_room_title(request: RoomRenameRequest, db: Session = Depends(get_db)):
  """채팅방 이름 변경"""
  logger.info(f"📩 클라이언트 채팅방 이름 변경")
  
  room_id = request.room_id
  new_title = request.new_title
  success = await RoomService.update_room_title_service(db, room_id, new_title)
  
  if not success:
    return JSONResponse(content=create_response(False, "채팅방을 찾을 수 없습니다.", None), status_code=404)

  return JSONResponse(content=create_response(True, "채팅방 이름 변경 성공", None), status_code=200)