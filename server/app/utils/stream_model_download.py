import json
import httpx
import asyncio
import time
from typing import AsyncGenerator
from app.core.config import settings
from app.utils.download_manager import active_downloads
from app.utils.response import create_response

async def stream_model_download(model_name: str, request) -> AsyncGenerator[str, None]:
  async with httpx.AsyncClient(timeout=httpx.Timeout(None)) as client:
    url = f"{settings.OLLAMA_API_BASE_URL}/api/pull"
    data = {"model": model_name, "stream": True}

    try:
      # 취소 가능한 태스크 저장
      active_downloads[model_name] = asyncio.current_task()

      async with client.stream("POST", url, json=data) as response:
        if response.status_code != 200:
          status = response.status_code
          error_content = b""
          
          async for chunk in response.aiter_bytes():
            error_content += chunk
          error_text = error_content.decode('utf-8')
          
          # JSON 형식이면 파싱하여 'error' 필드 추출
          try:
            error_json = json.loads(error_text)
            error_message = error_json.get('error', error_text)
          except json.JSONDecodeError:
            # JSON이 아니면 원래 텍스트 사용
            error_message = error_text
            
          yield json.dumps(create_response(False, error_message, {"model_name": model_name, "status": status})) + "\n"
          return

        total_size = 0
        completed_size = 0
        seen_digests = {}
        last_progress_time = time.time()
        last_progress_value = -1

        async for chunk in response.aiter_bytes():
          # 클라이언트가 취소했는지 확인
          if request.state.cancel:
            yield json.dumps(create_response(False, "모델 다운로드가 취소되었습니다.", {"model_name": model_name, "status": "cancelled"})) + "\n"
            return
          
          try:
            log = json.loads(chunk.decode("utf-8"))
          except json.JSONDecodeError:
            continue

          if "error" in log:
            yield json.dumps(create_response(False, f"다운로드 오류: {log.get('error', '알 수 없는 오류')}", {"model_name": model_name, "status": "error"})) + "\n"
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
            progress_rounded = round(progress, 2)
            
            # 같은 진행률을 반복해서 보내지 않도록 최적화 (1초에 한 번만 업데이트)
            current_time = time.time()
            if (progress_rounded != last_progress_value or 
              current_time - last_progress_time >= 1.0):
              
              last_progress_time = current_time
              last_progress_value = progress_rounded
              
              yield json.dumps(create_response(True, "다운로드 진행 중", {"model_name": model_name, "digest": digest, "status": "downloading", "progress": progress_rounded})) + "\n"

        yield json.dumps(create_response(True, "모델 다운로드가 완료되었습니다.", {"model_name": model_name, "status": "success", "progress": 100})) + "\n"

    finally:
      # 예외 발생 여부와 상관없이 active_downloads에서 제거
      if model_name in active_downloads:
        del active_downloads[model_name]
