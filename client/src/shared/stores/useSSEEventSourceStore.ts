import { create } from "zustand";

/**
 * SSE 타입 식별자 → 예: "chat", "title" 등
 */
type EventSourceType = string;

interface SSEEventSourceState {
  /** 타입별 SSE 시작 여부 */
  isStartSSE: Record<EventSourceType, boolean>;

  /**
   * SSE 시작 상태 설정
   * - setIsStartSSE("chat", true) → "chat" 타입의 시작 상태 설정
   */
  setIsStartSSE: (...args: [EventSourceType, boolean]) => void;

  /** 타입별 EventSource 맵 */
  eventSources: Record<EventSourceType, Record<string, EventSource>>;

  /**
   * EventSource 추가
   * - addEventSource("chat", roomId, eventSource) → "chat" 타입에 추가
   */
  addEventSource: (...args: [EventSourceType, string, EventSource]) => void;

  /** EventSource 제거 (하위 호환 동일) */
  removeEventSource: (...args: [EventSourceType, string]) => void;

  /** EventSource 가져오기 */
  getEventSource: (...args: [EventSourceType, string]) => EventSource | undefined;

  /** 특정 EventSource 연결 종료 */
  closeEventSource: (...args: [EventSourceType, string]) => void;

  /** 타입별 모든 EventSource 연결 종료 */
  closeAllEventSourcesByType: (type: EventSourceType) => void;

  /** 전체 EventSource 연결 종료 */
  closeAllEventSources: () => void;
}

export const useSSEEventSourceStore = create<SSEEventSourceState>((set, get) => ({
  isStartSSE: {},
  eventSources: {},

  // 시작 상태 설정
  setIsStartSSE: (...args) => {
    const [type, isStart] = args;
    set((state) => ({
      isStartSSE: { ...state.isStartSSE, [type]: isStart },
    }));
  },

  // EventSource 추가 / 제거 / 조회
  addEventSource: (...args) => {
    const [type, roomId, es] = args;
    set((state) => ({
      eventSources: {
        ...state.eventSources,
        [type]: { ...(state.eventSources[type] || {}), [roomId]: es },
      },
    }));
  },

  removeEventSource: (...args) => {
    const [type, roomId] = args;
    set((state) => {
      const newTypeMap = { ...(state.eventSources[type] || {}) };
      delete newTypeMap[roomId];
      const newEventSources = { ...state.eventSources, [type]: newTypeMap };
      if (Object.keys(newTypeMap).length === 0) delete newEventSources[type];
      return { eventSources: newEventSources };
    });
  },

  getEventSource: (...args) => {
    const [type, roomId] = args;
    return get().eventSources[type]?.[roomId];
  },

  // 연결 종료 로직
  closeEventSource: (...args) => {
    const [type, roomId] = args;
    const es = get().eventSources[type]?.[roomId];
    if (es) {
      console.log(`타입: ${type} / 채팅방: ${roomId} 의 SSE 연결 종료`);
      es.close();
      get().removeEventSource(type, roomId);
    }
  },

  closeAllEventSourcesByType: (type) => {
    const map = get().eventSources[type] || {};
    Object.values(map).forEach((es) => es.close());

    set((state) => {
      const newEventSources = { ...state.eventSources };
      delete newEventSources[type];
      return { eventSources: newEventSources };
    });

    get().setIsStartSSE(type, false);
  },

  closeAllEventSources: () => {
    Object.values(get().eventSources).forEach((map) => Object.values(map).forEach((es) => es.close()));
    set({ eventSources: {}, isStartSSE: {} });
  },
}));
