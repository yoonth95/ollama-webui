from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
import logging
from app.utils.response import create_response
from app.utils.handle_exceptions import handle_exceptions

router = APIRouter()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.get("/chat")
@handle_exceptions
async def test():

  return JSONResponse(content=create_response(True, "테스트", None), status_code=200)