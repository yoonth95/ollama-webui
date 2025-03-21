from typing import Dict, Any

# 현재 진행 중인 다운로드를 추적하는 전역 딕셔너리
active_downloads: Dict[str, Any] = {}

# 모델 다운로드 취소 여부를 추적하는 딕셔너리
cancelled_downloads: Dict[str, Any] = {}