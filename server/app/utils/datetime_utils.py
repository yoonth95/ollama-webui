from datetime import datetime, timezone, timedelta

def get_kst_time():
  """현재 한국 시간 반환"""
  return datetime.now(timezone.utc).astimezone(timezone(timedelta(hours=9)))