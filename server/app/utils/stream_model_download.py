import json
import aiohttp
import asyncio
from typing import AsyncGenerator
from app.core.config import settings
from app.utils.download_manager import active_downloads, cancelled_downloads
from app.utils.response import create_response

async def stream_model_download(model_name: str) -> AsyncGenerator[str, None]:
  async with aiohttp.ClientSession() as session:
    url = f"{settings.OLLAMA_API_BASE_URL}/api/pull"
    data = {"model": model_name, "stream": True}

    # 취소 가능한 태스크 저장
    active_downloads[model_name] = asyncio.current_task()
    
    async with session.post(url, json=data) as response:      
      if response.status != 200:
        error_text = await response.text()
        del active_downloads[model_name]
        yield json.dumps(create_response(False, error_text, {"model_name": model_name, "status": response.status})) + "\n"
        return

      total_size = 0
      completed_size = 0
      seen_digests = {}

      async for chunk in response.content:       
        if cancelled_downloads.get(model_name, False):  
          yield json.dumps(create_response(False, "다운로드 취소", {"model_name": model_name, "status": "cancelled"})) + "\n"
          del active_downloads[model_name]
          del cancelled_downloads[model_name]
          return
                  
        try:
          log = json.loads(chunk.decode("utf-8"))
        except json.JSONDecodeError:
          continue  
        
        if "error" in log:
          del active_downloads[model_name]
          return

        if "total" in log and "completed" in log:
          digest = log["digest"]
          total = log["total"]
          completed = log["completed"]

          if digest not in seen_digests:
            total_size += total
            completed_size = 0
            seen_digests[digest] = 0

          completed_size += (completed - seen_digests[digest])
          seen_digests[digest] = completed

          progress = (completed_size / total_size) * 100 if total_size > 0 else 0
          
          if progress == 100:
            completed_size = 0
            total_size = 0
          
          yield json.dumps(create_response(True, "다운로드 진행 중", {"model_name": model_name, "digest": digest, "status": "downloading", "progress": round(progress, 2)})) + "\n"

      yield json.dumps(create_response(True, "완료", {"model_name": model_name, "status": "success", "progress": 100})) + "\n"
      
    del active_downloads[model_name]  # 다운로드 완료 후 제거