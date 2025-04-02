from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.core.config import settings
from app.db.database import init_db
from app.api.endpoints import model_router, room_router, chat_router
from app.utils.response import create_response
import logging

logger = logging.getLogger(__name__)

async def validation_exception_handler(request: Request, exc: RequestValidationError):
  print("Validation Error 발생!")
  error_messages = []
  for error in exc.errors():
    field = error.get("loc", [])[-1]
    message = error.get("msg", "")
    error_messages.append(f"{field}: {message}")
  
  error_message = " | ".join(error_messages)
  logger.error(f"🚨 스키마 검증 오류: {error_message}")
  return JSONResponse(
    content=create_response(False, f"잘못된 요청 형식입니다.\n {error_message}", None),
    status_code=422
  )

def create_app() -> FastAPI:
  app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
  )

  app.add_exception_handler(RequestValidationError, validation_exception_handler)

  configure_cors(app)
  register_routers(app)
  
  init_db()

  return app

def configure_cors(app: FastAPI):
  """CORS 설정"""
  app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
  )

def register_routers(app: FastAPI):
  """라우터 등록"""
  app.include_router(model_router, prefix=settings.API_V1_STR, tags=["model"])
  app.include_router(room_router, prefix=settings.API_V1_STR, tags=["room"])
  app.include_router(chat_router, prefix=settings.API_V1_STR, tags=["chat"])

app = create_app()

if __name__ == "__main__":
  import uvicorn

  uvicorn.run(
    "main:app",
    host=settings.HOST,
    port=settings.PORT,
    reload=True,
  )
