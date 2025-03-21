from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# 데이터베이스 설정
DATABASE_URL = settings.DATABASE_URL
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# DB 초기화
def init_db():
  from app.db.models.room import Room  
  from app.db.models.chat import ChatMessage 
  
  Base.metadata.create_all(bind=engine)

# 세션 생성 함수
def get_db():
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()