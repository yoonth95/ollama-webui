import { create } from "zustand";

interface SSEEventSourceState {
  isStartSSE: boolean;

  // SSE 연결 시작 상태 설정
  setIsStartSSE: (isStartSSE: boolean) => void;

  // 채팅방 ID를 키로 사용하여 EventSource 객체 저장
  eventSources: Record<string, EventSource>;

  // EventSource 추가
  addEventSource: (roomId: string, eventSource: EventSource) => void;

  // EventSource 제거
  removeEventSource: (roomId: string) => void;

  // EventSource 가져오기
  getEventSource: (roomId: string) => EventSource | undefined;

  // 특정 채팅방의 EventSource 연결 종료
  closeEventSource: (roomId: string) => void;

  // 모든 EventSource 연결 종료
  closeAllEventSources: () => void;
}

export const useSSEEventSourceStore = create<SSEEventSourceState>((set, get) => ({
  isStartSSE: false,
  eventSources: {},

  // SSE 연결 시작 상태 설정
  setIsStartSSE: (isStartSSE) => set({ isStartSSE }),

  // EventSource 추가
  addEventSource: (roomId, eventSource) => {
    set((state) => ({
      eventSources: {
        ...state.eventSources,
        [roomId]: eventSource,
      },
    }));
  },

  // EventSource 제거
  removeEventSource: (roomId) => {
    set((state) => {
      const newEventSources = { ...state.eventSources };
      delete newEventSources[roomId];
      return { eventSources: newEventSources };
    });
  },

  // EventSource 가져오기
  getEventSource: (roomId) => {
    return get().eventSources[roomId];
  },

  // 특정 채팅방의 EventSource 연결 종료
  closeEventSource: (roomId) => {
    const eventSource = get().eventSources[roomId];
    if (eventSource) {
      console.log(`채팅방 ID: ${roomId}의 SSE 연결 종료`);
      eventSource.close();
      get().removeEventSource(roomId);
    }
  },

  // 모든 EventSource 연결 종료
  closeAllEventSources: () => {
    const { eventSources } = get();

    Object.entries(eventSources).forEach(([roomId, eventSource]) => {
      console.log(`채팅방 ID: ${roomId}의 SSE 연결 종료`);
      eventSource.close();
    });

    set({ eventSources: {} });
    get().setIsStartSSE(false);
  },
}));
