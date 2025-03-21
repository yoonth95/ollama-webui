from pydantic_settings import BaseSettings

class Settings(BaseSettings):
  API_V1_STR: str = "/api/v1"
  PROJECT_NAME: str = "FastAPI Ollama Models"
  
  OLLAMA_API_BASE_URL: str = "http://localhost:11434"
  
  DATABASE_URL: str = "sqlite:///./database.db"
  
  HOST: str = "http://localhost"
  PORT: int = 8000
  
  class Config:
    env_file = ".env"

settings = Settings()