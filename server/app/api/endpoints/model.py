from fastapi import APIRouter, Query, Request
from fastapi.responses import JSONResponse
import logging
from app.services.model import ModelService
from app.schemas.model import ModelNameRequest
from app.utils.response import create_response
from app.utils.handle_exceptions import handle_exceptions

router = APIRouter()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.get("/model/get-models")
@handle_exceptions
async def get_models():
  """사용 가능한 모든 모델 조회"""
  logger.info("🔍 클라이언트에서 모델 목록 요청 받음")

  return await ModelService.get_models()

@router.get("/model/download")
@handle_exceptions
async def model_download(request: Request, model_name: str = Query(..., description="다운로드할 모델 이름")):
  """모델 다운로드"""
  logger.info(f"🔍 클라이언트에서 {model_name} 모델 다운로드")
  
  request.state.cancel = False  # 요청 상태에 취소 여부 추가
  return await ModelService.model_download(model_name, request)

@router.post("/model/download-cancel")
@handle_exceptions
async def model_download_cancel(request: ModelNameRequest):
  """설치 진행 중인 모델 다운로드 취소"""
  logger.info(f"🔍 클라이언트에서 모델 다운로드 취소")
  
  return await ModelService.model_download_cancel(request.model_name)

@router.delete("/model/delete/")
@handle_exceptions
async def model_delete():  
  """모델이 존재하지 않는 경우"""
  return await JSONResponse(content=create_response(False, "모델이 존재하지 않습니다.", None), status_code=404)

@router.delete("/model/delete/{model_name}")
@handle_exceptions
async def model_delete(model_name: str):
  """모델 삭제"""
  logger.info(f"🔍 클라이언트에서 모델 삭제 요청 받음")
  
  return await ModelService.model_delete(model_name)