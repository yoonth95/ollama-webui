from functools import wraps
from sqlalchemy.orm import Session
import logging

logger = logging.getLogger(__name__)

def transactional(func):
  """SQLAlchemy 트랜잭션을 관리하는 데코레이터. 함수 실행 시 트랜잭션 시작, 성공 시 커밋, 예외 발생 시 롤백"""
  @wraps(func)
  async def wrapper(*args, **kwargs):
    # db 파라미터 찾기
    db = None
    for arg in args:
      if isinstance(arg, Session):
        db = arg
        break
    
    if not db:
      for _, value in kwargs.items():
        if isinstance(value, Session):
          db = value
          break
  
    if not db:
      logger.error("트랜잭션 데코레이터에 Session 객체가 전달되지 않았습니다.")
      return await func(*args, **kwargs)
    
    try:
      # 트랜잭션 시작
      db.begin()
      
      # 원래 함수 실행, commit 파라미터 False로 전달 (있는 경우)
      if 'commit' in kwargs:
        kwargs['commit'] = False
      result = await func(*args, **kwargs)
      
      # 성공 시 커밋
      db.commit()
      return result
    except Exception as e:
      # 예외 발생 시 롤백
      db.rollback()
      logger.error(f"트랜잭션 중 오류 발생: {e}")
      raise  # 예외 재발생 (handle_exceptions 데코레이터가 처리)
  
  return wrapper 