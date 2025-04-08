from pydantic import BaseModel
from datetime import datetime
from app.utils.datetime_utils import convert_datetime_to_iso

class TimeModelMixin(BaseModel):
  """datetime 필드를 ISO 형식으로 변환하는 믹스인 클래스"""
    
  def model_dump(self, **kwargs):
    dump = super().model_dump(**kwargs)
    for field_name, value in dump.items():
      if isinstance(value, datetime):
        dump[field_name] = convert_datetime_to_iso(value)
    return dump 