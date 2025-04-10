import asyncio
import json
from typing import Dict, List, Any, Optional, Set, Callable
import threading
import logging

logger = logging.getLogger(__name__)

class AsyncInMemoryPubSub:
  """
  비동기 환경에 최적화된 인메모리 PubSub 구현
  Redis를 대체하는 간단한 구현으로, FastAPI 비동기 환경에서 사용하기 적합
  """
  _instance = None
  _lock = threading.Lock()
  
  def __new__(cls):
    """싱글톤 패턴으로 인스턴스 관리"""
    with cls._lock:
      if cls._instance is None:
        cls._instance = super(AsyncInMemoryPubSub, cls).__new__(cls)
        cls._instance._initialized = False
      return cls._instance
  
  def __init__(self):
    """초기화 (싱글톤 패턴으로 한 번만 실행)"""
    if self._initialized:
      return
        
    # 키-값 저장소
    self._storage: Dict[str, Any] = {}
    # 각 채널별 메시지 큐
    self._channels: Dict[str, asyncio.Queue] = {}
    # 각 채널별 구독자 목록
    self._subscribers: Dict[str, Set[str]] = {}
    # 스레드 안전성을 위한 락
    self._storage_lock = threading.Lock()
    
    # 이벤트 루프 참조
    try:
      self._loop = asyncio.get_running_loop()
    except RuntimeError:
      self._loop = asyncio.new_event_loop()
      asyncio.set_event_loop(self._loop)
        
    self._initialized = True
    logger.info("AsyncInMemoryPubSub 초기화 완료")
  
  def set(self, key: str, value: Any) -> bool:
    """키-값 저장 (Redis set 호환)"""
    with self._storage_lock:
      self._storage[key] = value
      return True
  
  def get(self, key: str) -> Any:
    """키-값 조회 (Redis get 호환)"""
    with self._storage_lock:
      if key in self._storage:
        # 바이트 객체로 반환 (Redis와 동일하게)
        if isinstance(self._storage[key], str):
          return self._storage[key].encode('utf-8')
        return self._storage[key]
      return None
  
  def delete(self, key: str) -> bool:
    """키 삭제 (Redis delete 호환)"""
    with self._storage_lock:
      if key in self._storage:
        del self._storage[key]
        return True
      return False
  
  async def publish(self, channel: str, message: Any) -> int:
    """채널에 메시지 발행 (Redis publish 호환)"""
    # 채널이 없으면 생성
    if channel not in self._channels:
      self._channels[channel] = asyncio.Queue()
    
    # 메시지 enqueue (문자열이면 유지)
    message_data = message
    if not isinstance(message, bytes) and not isinstance(message, str):
      message_data = json.dumps(message)
    
    # 큐에 메시지 추가
    await self._channels[channel].put({
      "type": "message",
      "channel": channel.encode('utf-8') if isinstance(channel, str) else channel,
      "data": message_data.encode('utf-8') if isinstance(message_data, str) else message_data
    })
    
    # 구독자 수 반환
    subscriber_count = len(self._subscribers.get(channel, set()))
    logger.debug(f"메시지 발행: {channel}, 구독자: {subscriber_count}개")
    return subscriber_count
  
  def pubsub(self):
    """PubSub 인터페이스 반환 (Redis pubsub 호환)"""
    return AsyncInMemoryPubSubClient(self)


class AsyncInMemoryPubSubClient:
  """
  Redis PubSub 클라이언트와 호환되는 인터페이스
  """
  def __init__(self, parent):
    self.parent = parent
    self._subscribed_channels: Set[str] = set()
    self._client_id = f"client_{id(self)}"
  
  def subscribe(self, *channels):
    """채널 구독 (Redis subscribe 호환)"""
    for channel in channels:
      # 부모의 채널 큐 초기화
      if channel not in self.parent._channels:
        self.parent._channels[channel] = asyncio.Queue()
      
      # 부모의 구독자 목록에 추가
      if channel not in self.parent._subscribers:
        self.parent._subscribers[channel] = set()
      self.parent._subscribers[channel].add(self._client_id)
      
      # 구독 채널 목록에 추가
      self._subscribed_channels.add(channel)
            
    logger.debug(f"채널 구독: {channels}")
  
  def unsubscribe(self, *channels):
    """채널 구독 취소 (Redis unsubscribe 호환)"""
    for channel in channels:
      # 구독 채널 목록에서 제거
      if channel in self._subscribed_channels:
        self._subscribed_channels.remove(channel)
      
      # 부모의 구독자 목록에서 제거
      if channel in self.parent._subscribers:
        if self._client_id in self.parent._subscribers[channel]:
          self.parent._subscribers[channel].remove(self._client_id)
        
        # 구독자가 없으면 채널 삭제
        if not self.parent._subscribers[channel]:
          del self.parent._subscribers[channel]
      
    logger.debug(f"채널 구독 취소: {channels}")
  
  async def get_message(self, ignore_subscribe_messages=True, timeout=0.01) -> Optional[Dict]:
    """
    메시지 조회 (Redis get_message 호환)
    
    비동기적으로 구독한 채널에서 메시지를 확인하고 반환
    """
    # 구독한 채널이 없으면 None 반환
    if not self._subscribed_channels:
      return None
        
    # 모든 구독 채널 확인
    for channel in list(self._subscribed_channels):
      # 부모의 채널 큐에서 메시지 확인
      if channel in self.parent._channels:
        try:
          # 메시지 큐에 메시지가 있는지 확인 (non-blocking)
          message = self.parent._channels[channel].get_nowait()
          # task_done 호출
          self.parent._channels[channel].task_done()
          
          # 구독 확인 메시지면 무시
          if ignore_subscribe_messages and message.get("type") == "subscribe":
            continue
              
          return message
        except asyncio.QueueEmpty:
          # 메시지가 없으면 다음 채널 확인
          pass
                
    # 메시지가 없으면 잠시 대기 후 None 반환
    await asyncio.sleep(timeout)
    return None
  
  def close(self):
    """연결 종료 - 모든 구독 취소 (Redis close 호환)"""
    self.unsubscribe(*list(self._subscribed_channels))
    logger.debug(f"PubSub 클라이언트 종료: {self._client_id}")


# 싱글톤 인스턴스 생성
memory_pubsub = AsyncInMemoryPubSub() 