import { useCallback, useEffect, useRef } from "react";
import { useShallow } from "zustand/shallow";
import { useSSEEventSourceStore } from "@/shared/stores/useSSEEventSourceStore";
import useChatRoomStore from "@/shared/stores/useChatRoomStore";

/**
 * 채팅방 제목 SSE 훅
 *  - /room/stream-title/{room_id} 엔드포인트와 연결하여 제목 변경 이벤트 수신
 *  - 수신한 제목을 `useChatRoomStore` 의 `updateChatRoomTitle` 로 업데이트
 *  - `useSSEEventSourceStore` 를 통해 EventSource 인스턴스 상태를 공유
 */
interface UseSSETitlePropsType {
  chatRoomId: string;
}

const SSE_TYPE = "title" as const;

export const useSSETitle = ({ chatRoomId }: UseSSETitlePropsType) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const isConnectingRef = useRef(false);

  // useSSEEventSourceStore 훅
  const [isStartSSE, setIsStartSSE, addEventSource, closeEventSource, getEventSource] = useSSEEventSourceStore(
    useShallow((state) => [
      state.isStartSSE[SSE_TYPE] ?? false,
      state.setIsStartSSE,
      state.addEventSource,
      state.closeEventSource,
      state.getEventSource,
    ]),
  );

  // 제목 업데이트 스토어 메서드
  const updateChatRoomTitle = useChatRoomStore((state) => state.updateChatRoomTitle);

  // 연결 해제 및 정리
  const cleanupConnection = useCallback(() => {
    if (!chatRoomId) return;

    closeEventSource(SSE_TYPE, chatRoomId);
    setIsStartSSE(SSE_TYPE, false);

    eventSourceRef.current = null;
    isConnectingRef.current = false;
  }, [chatRoomId, closeEventSource, setIsStartSSE]);

  // SSE 연결 시작
  const startSSEConnection = useCallback(() => {
    if (!chatRoomId || isConnectingRef.current) return;

    // 이미 연결 중이면 무시
    const existing = getEventSource(SSE_TYPE, chatRoomId);
    if (existing) {
      console.log(`[${chatRoomId}/${SSE_TYPE}] 이미 연결되어 있음`);
      return;
    }

    // 연결 시작 플래그 설정
    setIsStartSSE(SSE_TYPE, true);
  }, [chatRoomId, getEventSource, setIsStartSSE]);

  // 실제 EventSource 연결 로직
  useEffect(() => {
    // 연결 시작 상태가 아니거나 roomId 가 없으면 연결하지 않음
    if (!chatRoomId || !isStartSSE) return;

    // 이미 연결되어 있다면 종료
    if (getEventSource(SSE_TYPE, chatRoomId)) return;

    const eventSource = new EventSource(`/api/v1/room/stream-title/${chatRoomId}`);
    eventSourceRef.current = eventSource;
    addEventSource(SSE_TYPE, chatRoomId, eventSource);

    // 연결 성공
    eventSource.addEventListener("connected", (event) => {
      console.log(`title SSE 연결 성공: `, event.data);
      isConnectingRef.current = false;
    });

    // 타이틀 수신 이벤트
    eventSource.addEventListener("title", (event) => {
      try {
        const data = JSON.parse(event.data);
        const { title } = data;

        if (title) {
          updateChatRoomTitle(chatRoomId, title);
          console.log(`${chatRoomId} title 업데이트 수신:`, title);
          cleanupConnection();
        }
      } catch (error) {
        console.error(`${chatRoomId} title 데이터 파싱 오류`, error);
      }
    });

    // 서버 ping (연결 유지)
    eventSource.addEventListener("ping", () => {});

    // 오류 이벤트 -> 연결 종료
    eventSource.addEventListener("error", (event) => {
      console.error(`${chatRoomId} title SSE 오류`, event);
      cleanupConnection();
    });

    // 컴포넌트 언마운트 시 정리
    return () => {
      cleanupConnection();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatRoomId, isStartSSE]);

  return {
    startSSEConnection,
  };
};
