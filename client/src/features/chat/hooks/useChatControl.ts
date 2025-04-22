import { useSSEEventSourceStore } from "@/shared/stores/useSSEEventSourceStore";
import useChatCancel from "@/features/chat/queries/useChatCancel";

/**
 * 채팅 제어 기능을 제공하는 훅
 * SSE 연결 없이 채팅 중단 기능만 필요한 컴포넌트에서 사용
 * @param chatRoomId 채팅방 ID
 * @returns 채팅 중단 관련 함수들
 */
export const useChatControl = (chatRoomId: string) => {
  const setIsStartSSE = useSSEEventSourceStore((state) => state.setIsStartSSE);
  const closeEventSource = useSSEEventSourceStore((state) => state.closeEventSource);
  const { mutate: regularCancelMutation } = useChatCancel(false); // 일반 중단
  const { mutate: forceStopMutation } = useChatCancel(true); // 강제 중단

  // 사용자가 직접 호출할 수 있는 중단 함수
  const cancelChat = () => {
    if (chatRoomId) {
      console.log("사용자 요청에 의한 일반 중단");
      regularCancelMutation({ roomId: chatRoomId });
      setIsStartSSE(false);

      // 스토어를 통해 SSE 연결 종료
      closeEventSource(chatRoomId);
    }
  };

  // 강제 중단 함수
  const forceStopChat = () => {
    if (chatRoomId) {
      console.log("사용자 요청에 의한 강제 중단");
      forceStopMutation({ roomId: chatRoomId });
      setIsStartSSE(false);

      // 스토어를 통해 SSE 연결 종료
      closeEventSource(chatRoomId);
    }
  };

  return {
    cancelChat, // 일반 중단 함수 (부분 응답 저장)
    forceStopChat, // 강제 중단 함수 (저장 안 함)
  };
};
