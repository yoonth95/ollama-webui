from functools import wraps
from fastapi.responses import JSONResponse
from aiohttp import ClientError
from app.utils.response import create_response
import logging

logger = logging.getLogger(__name__)

def handle_exceptions(func):
  @wraps(func)
  async def wrapper(*args, **kwargs):
    try:
      return await func(*args, **kwargs)
    
    except ClientError as e:
      logger.error(f"🚨 Ollama 접속 오류: {e}")
      return JSONResponse(content=create_response(False, "Ollama 서비스가 실행되지 않았습니다. 설치 또는 실행 상태를 확인하세요.", None), status_code=503)
    
    except Exception as e:
      logger.error(f"🚨 서버 오류: {e}")
      return JSONResponse(content=create_response(False, "서버 오류", None), status_code=500)
    
  return wrapper
