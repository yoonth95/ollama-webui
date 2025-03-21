from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import init_db
from app.api.endpoints import model_router, room_router, chat_router

def create_app() -> FastAPI:
  app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
  )

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
