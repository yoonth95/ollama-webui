import aiohttp
import json
from fastapi.responses import JSONResponse
from fastapi.responses import StreamingResponse
from app.core.config import settings
from app.schemas.model import ModelInfo, ModelList
from app.utils.stream_model_download import stream_model_download
from app.utils.response import create_response
from app.utils.download_manager import active_downloads, cancelled_downloads

class ModelService:
  @staticmethod
  async def get_models() -> ModelList:
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
  async def model_download(model_name: str) -> StreamingResponse:
    ## 모델 다운로드 여부 체크
    async with aiohttp.ClientSession() as session:
      async with session.get(f"{settings.OLLAMA_API_BASE_URL}/api/tags") as response:
        data = await response.json()
        if len(data['models']) > 0 and model_name == data['models'][0]['model']:
          return JSONResponse(content=create_response(False, "이미 설치된 모델입니다.", None), status_code=400)

    # 모델 다운로드 진행
    stream = stream_model_download(model_name)
    
    first_chunk = await anext(stream, None)
    try:
      first_chunk = json.loads(first_chunk)
      if not first_chunk["ok"]:
        message_dic = json.loads(first_chunk["message"])
        return JSONResponse(
          content=create_response(False, message_dic["error"], None),
          status_code=first_chunk["data"]["status"]
        )
    except Exception as e:
      return JSONResponse(
        content=create_response(False, "다운로드 실패", None),
        status_code=500
      )
    
    return StreamingResponse(stream, media_type="application/json")
  
  @staticmethod
  async def model_download_cancel(model_name: str):
    if model_name in active_downloads:
      cancelled_downloads[model_name] = True
      return JSONResponse(content=create_response(True, "다운로드 취소", None), status_code=200)
  
    return JSONResponse(content=create_response(False, "해당 모델이 다운로드가 되고 있지 않습니다.", None), status_code=404)
  
  @staticmethod
  async def model_delete(model_name: str):
    async with aiohttp.ClientSession() as session:
      url = f"{settings.OLLAMA_API_BASE_URL}/api/delete"
      data = {"model": model_name}
      
      async with session.delete(url, json=data) as response:
        if response.status == 200:
          return JSONResponse(content=create_response(True, "모델 삭제 성공", None), status_code=200)
        elif response.status == 404:
          return JSONResponse(content=create_response(False, "모델이 존재하지 않습니다.", None), status_code=404)
        
        return JSONResponse(content=create_response(False, "모델 삭제 실패", None), status_code=500)