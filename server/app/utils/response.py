from typing import Any

def create_response(ok: bool, message: str, data: Any = None):
  return {
    "ok": ok,
    "message": message,
    "data": data,
  }
