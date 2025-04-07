from pydantic import BaseModel
from typing import List, Optional, Literal

# class ChatMessage(BaseModel):
#   role: Literal["system", "user", "assistant"]
#   content: str

# class ChatRequest(BaseModel):
#   model: str
#   message: str

# class ChatHistory(BaseModel):
#   messages: List[ChatMessage]

# class ChatResponse(BaseModel):
#   success: bool
#   message: str
#   data: Optional[ChatMessage]
  
class ChatUserMessageType(BaseModel):
  room_id: str
  model: str
  content: str
  images: Optional[List[str]] = None
