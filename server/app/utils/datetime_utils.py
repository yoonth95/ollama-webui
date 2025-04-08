from datetime import datetime, timezone, timedelta

def get_kst_time():
  """현재 한국 시간 반환"""
  return datetime.now(timezone.utc).astimezone(timezone(timedelta(hours=9)))

def convert_datetime_to_iso(dt):
  """datetime 객체를 ISO 형식 문자열로 변환"""
  if isinstance(dt, datetime):
    return dt.isoformat()
  return dt