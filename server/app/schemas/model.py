from pydantic import BaseModel
from typing import List, Optional

class ModelInfo(BaseModel):
  model: str
  size: Optional[str]
  parameter_size: Optional[str]
  
class ModelList(BaseModel):
  models: List[ModelInfo]
  
class ModelNameRequest(BaseModel):
  model_name: str