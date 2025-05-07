import { create } from "zustand";

// SSE 이벤트 유형 정의
export type SSEEventType = "chat" | "title";

// EventSource 식별을 위한 키 생성 함수
export const createEventSourceKey = (roomId: string, type: SSEEventType): string => {
  return `${roomId}:${type}`;
};

interface SSEEventSourceState {
  // 채팅방 ID와 타입(chat/title)을 키로 사용하여 EventSource 객체를 저장
  eventSources: Record<string, EventSource>;

  isStartSSE: Record<SSEEventType, boolean>;
  setIsStartSSE: (type: SSEEventType, isStartSSE: boolean) => void;

  // EventSource 추가
  addEventSource: (roomId: string, type: SSEEventType, eventSource: EventSource) => void;

  // EventSource 제거
  removeEventSource: (roomId: string, type: SSEEventType) => void;

  // EventSource 가져오기
  getEventSource: (roomId: string, type: SSEEventType) => EventSource | undefined;

  // 특정 채팅방과 타입의 EventSource 연결 종료
  closeEventSource: (roomId: string, type: SSEEventType) => void;

  // 특정 채팅방의 모든 타입 EventSource 연결 종료
  closeRoomEventSources: (roomId: string) => void;

  // 모든 EventSource 연결 종료
  closeAllEventSources: () => void;
}

export const useSSEEventSourceStore = create<SSEEventSourceState>((set, get) => ({
  // 초기 상태 설정
  eventSources: {},
  isStartSSE: {
    chat: false,
    title: false,
  },

  // SSE 연결 시작 상태 설정 (타입별로 관리)
  setIsStartSSE: (type, isStartSSE) => {
    set((state) => ({
      isStartSSE: {
        ...state.isStartSSE,
        [type]: isStartSSE,
      },
    }));
  },

  // EventSource 추가 (타입과 roomId로 구분)
  addEventSource: (roomId, type, eventSource) => {
    const key = createEventSourceKey(roomId, type);
    set((state) => ({
      eventSources: {
        ...state.eventSources,
        [key]: eventSource,
      },
    }));
  },

  // EventSource 제거
  removeEventSource: (roomId, type) => {
    const key = createEventSourceKey(roomId, type);
    set((state) => {
      const newEventSources = { ...state.eventSources };
      delete newEventSources[key];
      return { eventSources: newEventSources };
    });
  },

  // EventSource 가져오기
  getEventSource: (roomId, type) => {
    const key = createEventSourceKey(roomId, type);
    return get().eventSources[key];
  },

  // 특정 채팅방과 타입의 EventSource 연결 종료
  closeEventSource: (roomId, type) => {
    const key = createEventSourceKey(roomId, type);
    const eventSource = get().eventSources[key];
    if (eventSource) {
      console.log(`채팅방 ID: ${roomId}, 타입: ${type}의 SSE 연결 종료`);
      eventSource.close();
      get().removeEventSource(roomId, type);
    }
  },

  // 특정 채팅방의 모든 타입 EventSource 연결 종료
  closeRoomEventSources: (roomId) => {
    const { eventSources } = get();

    // 특정 채팅방과 관련된 모든 EventSource 찾기
    Object.entries(eventSources).forEach(([key, eventSource]) => {
      if (key.startsWith(`${roomId}:`)) {
        console.log(`채팅방 ID: ${roomId}의 SSE 연결 종료 (키: ${key})`);
        eventSource.close();
        // key는 "roomId:type" 형태로 되어 있으므로 타입을 추출
        const type = key.split(":")[1] as SSEEventType;
        get().removeEventSource(roomId, type);
      }
    });
  },

  // 모든 EventSource 연결 종료
  closeAllEventSources: () => {
    const { eventSources } = get();

    Object.entries(eventSources).forEach(([key, eventSource]) => {
      console.log(`SSE 연결 종료 (키: ${key})`);
      eventSource.close();
    });

    set({ eventSources: {} });
    set({ isStartSSE: { chat: false, title: false } });
  },
}));
