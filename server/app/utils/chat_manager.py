import asyncio
from typing import Dict, Any

# 현재 진행 중인 채팅 생성 태스크 (room_id: 태스크)
active_chats: Dict[str, asyncio.Task] = {}

# 취소된 채팅 응답 생성 (room_id: 취소 여부)
cancelled_chats: Dict[str, bool] = {}

# 강제 취소된 채팅 (room_id: 강제 취소 여부)
force_stopped_chats: Dict[str, bool] = {}

# 응답 생성이 완료된 채팅 (room_id: 완료 여부)
completed_chats: Dict[str, bool] = {} 