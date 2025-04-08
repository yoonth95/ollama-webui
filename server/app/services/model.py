import aiohttp
import json
import httpx
from fastapi.responses import JSONResponse
from fastapi.responses import StreamingResponse
from app.core.config import settings
from app.schemas.model import ModelInfo, ModelList
from app.utils.stream_model_download import stream_model_download
from app.utils.response import create_response
from app.utils.download_manager import active_downloads, cancelled_downloads

async def already_installed_response(model_name: str):
  """이미 설치된 모델 응답을 비동기 제너레이터로 반환"""
  yield json.dumps({
    "ok": True,
    "message": "이미 설치된 모델입니다.",
    "data": {
      "model_name": model_name,
      "status": "already_installed",
      "progress": 100
    }
  }) + "\n"

class ModelService:
  @staticmethod
  async def get_models() -> ModelList:
    """사용 가능한 모든 모델 조회"""
    async with aiohttp.ClientSession() as session:
      async with session.get(f"{settings.OLLAMA_API_BASE_URL}/api/tags") as response:                
        data = await response.json()
        models = [
          ModelInfo(
            model=model["model"],
            size=str(round(model.get("size", 0) / (1024 ** 3), 2))+'GB',
            parameter_size=model.get("details", {}).get("parameter_size")
          )
          for model in data.get("models", [])  # models 없을 경우 빈 리스트 반환
        ]
        
        data = (ModelList(models=models).model_dump())["models"]
        return JSONResponse(content=create_response(True, "모델 목록 조회 성공", data), status_code=200)
  
  @staticmethod
  async def model_download(model_name: str, request) -> StreamingResponse:
    """모델 다운로드 스트리밍 응답 제공"""
    async with httpx.AsyncClient() as client:
      response = await client.get(f"{settings.OLLAMA_API_BASE_URL}/api/tags")
      data = response.json()
      
      # 모델이 이미 설치되어 있는지 더 명확하게 확인
      is_installed = False
      if 'models' in data and data['models']:
        for model in data['models']:
          if model.get('model') == model_name:
            is_installed = True
            break
      
      if is_installed:
        return StreamingResponse(already_installed_response(model_name), media_type="application/json")
    
    ## 모델 다운로드
    return StreamingResponse(stream_model_download(model_name, request), media_type="application/json")
  
  @staticmethod
  async def model_download_cancel(model_name: str):
    """설치 진행 중인 모델 다운로드 취소"""
    if model_name in active_downloads:
      cancelled_downloads[model_name] = True
      return JSONResponse(content=create_response(True, "다운로드 취소", None), status_code=200)
  
    return JSONResponse(content=create_response(False, "해당 모델이 다운로드가 되고 있지 않습니다.", None), status_code=404)
  
  @staticmethod
  async def model_delete(model_name: str):
    """설치된 모델 삭제"""
    async with aiohttp.ClientSession() as session:
      url = f"{settings.OLLAMA_API_BASE_URL}/api/delete"
      data = {"model": model_name}
      
      async with session.delete(url, json=data) as response:
        if response.status == 200:
          return JSONResponse(content=create_response(True, "모델 삭제 성공", None), status_code=200)
        elif response.status == 404:
          return JSONResponse(content=create_response(False, "모델이 존재하지 않습니다.", None), status_code=404)
        
        return JSONResponse(content=create_response(False, "모델 삭제 실패", None), status_code=500)