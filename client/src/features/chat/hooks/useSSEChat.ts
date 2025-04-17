import { useState, useEffect, useRef } from "react";
import { useShallow } from "zustand/shallow";
import { useSSEEventSourceStore } from "@/shared/stores/useSSEEventSourceStore";
import useChatCancel from "@/features/chat/queries/useChatCancel";
import { SSEChatDataType } from "@/features/chat/types/sseChatDataType";

/**
 * 채팅방 SSE 연결을 관리하는 훅
 * @param chatRoomId 채팅방 ID
 * @param isOptimistic 최적화 모드 여부
 * @returns SSE 응답 데이터와 상태, 중단 함수들
 */
interface UseSSEChatPropsType {
  chatRoomId: string;
  isOptimistic: boolean;
  setIsReceivingResponse: (isReceivingResponse: boolean) => void;
}
export const useSSEChat = ({ chatRoomId, isOptimistic, setIsReceivingResponse }: UseSSEChatPropsType) => {
  const { mutate: regularCancelMutation } = useChatCancel(false); // 일반 중단
  const { mutate: forceStopMutation } = useChatCancel(true); // 강제 중단

  // SSE 이벤트 소스 스토어
  const [addEventSource, closeEventSource] = useSSEEventSourceStore(
    useShallow((state) => [state.addEventSource, state.closeEventSource]),
  );

  const [sseData, setSseData] = useState<SSEChatDataType>({
    isReceiving: false,
    content: "",
  });
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // 채팅방 ID가 없는 경우 연결하지 않음
    if (!chatRoomId || !isOptimistic) {
      return;
    }

    // SSE 연결 시작 상태 설정
    setSseData({ isReceiving: true, content: "" });

    // SSE 연결 생성
    const eventSource = new EventSource(`/api/v1/chat/stream/${chatRoomId}`);
    eventSourceRef.current = eventSource;

    addEventSource(chatRoomId, eventSource);

    // 연결 성공 이벤트
    eventSource.addEventListener("connected", (event) => {
      console.log("SSE 연결 성공:", event.data);
    });

    // 메시지 이벤트
    eventSource.addEventListener("message", (event) => {
      try {
        setIsReceivingResponse(true);
        const data = JSON.parse(event.data);

        const responseData = {
          isRetry: false,
          isReceiving: true,
          content: data.full,
          model: data.model,
          createdAt: data.created_at,
        };

        // 서버에서 오류 발생 시 재시도 메시지
        if (data.warning) {
          console.warn(data.message);
          responseData.content = data.message;
          responseData.isRetry = true;
          setSseData(responseData);
        }

        // 이미 저장된 답변이 있는 경우 또는 메시지가 계속 추가되는 경우
        if (data.init || data.delta) {
          setSseData(responseData);
        }

        // 완료 메시지
        if (data.done) {
          responseData.isReceiving = false;
          setSseData(responseData);
          setIsReceivingResponse(false);
        }
      } catch (error) {
        console.error("SSE 메시지 파싱 오류:", error);
        regularCancelMutation({ roomId: chatRoomId });
        setIsReceivingResponse(false);
        closeEventSource(chatRoomId);
      }
    });

    // 오류 이벤트
    eventSource.addEventListener("error", (event) => {
      try {
        // 오류 데이터 파싱 시도
        const errorData = JSON.parse((event as MessageEvent).data || "{}");

        // 오류 상태 설정
        setSseData({
          isReceiving: false,
          content: "",
          error: true,
          errorType: errorData.error_type || "UNKNOWN",
          errorMessage: errorData.message || "알 수 없는 오류가 발생했습니다",
        });
        setIsReceivingResponse(false);

        const errorType = errorData.error_type;
        if (errorType === "NETWORK" || errorType === "TIMEOUT") {
          regularCancelMutation({ roomId: chatRoomId });
        } else if (errorType === "MODEL" || errorType === "CONTENT") {
          forceStopMutation({ roomId: chatRoomId });
        } else {
          regularCancelMutation({ roomId: chatRoomId });
        }
        console.error("SSE 오류:", errorData.message || "메시지를 받는 중 오류가 발생했습니다");
        closeEventSource(chatRoomId);
      } catch {
        // 기본 오류 처리
        setSseData({
          isReceiving: false,
          content: "",
          error: true,
          errorType: "CONNECTION",
          errorMessage: "연결 중 오류가 발생했습니다",
        });
        setIsReceivingResponse(false);

        console.error("서버 연결 중 오류가 발생했습니다");
        regularCancelMutation({ roomId: chatRoomId });
        closeEventSource(chatRoomId);
      }
    });

    // 타임아웃 이벤트
    eventSource.addEventListener("timeout", () => {
      setSseData({
        isReceiving: false,
        content: "",
        error: true,
        errorType: "TIMEOUT",
        errorMessage: "연결 시간이 초과되었습니다",
      });
      setIsReceivingResponse(false);

      console.warn("연결 시간이 초과되었습니다");
      regularCancelMutation({ roomId: chatRoomId });
      closeEventSource(chatRoomId);
    });

    // 비활성 이벤트
    eventSource.addEventListener("inactive", () => {
      setSseData({
        isReceiving: false,
        content: "",
      });
      setIsReceivingResponse(false);

      console.info("장시간 활동이 없어 연결이 종료되었습니다");
      forceStopMutation({ roomId: chatRoomId });
      closeEventSource(chatRoomId);
    });

    // 핑-퐁 이벤트 (서버 연결 유지용)
    eventSource.addEventListener("ping", () => {
      // 핑 이벤트 수신 시 특별한 처리 없음 (서버 연결 유지 목적)
    });

    // 컴포넌트 언마운트 또는 의존성 변경 시 연결 종료
    return () => {
      if (eventSourceRef.current) {
        console.log("컴포넌트 언마운트 시 SSE 연결 종료");
        closeEventSource(chatRoomId);
        eventSourceRef.current = null;
      }
    };
  }, [
    chatRoomId,
    isOptimistic,
    regularCancelMutation,
    forceStopMutation,
    setIsReceivingResponse,
    addEventSource,
    closeEventSource,
  ]);

  // 사용자가 직접 호출할 수 있는 중단 함수들
  const cancelChat = () => {
    if (chatRoomId) {
      console.log("사용자 요청에 의한 일반 중단");
      regularCancelMutation({ roomId: chatRoomId });
      setIsReceivingResponse(false);

      closeEventSource(chatRoomId);
      eventSourceRef.current = null;
    }
  };

  const forceStopChat = () => {
    if (chatRoomId) {
      console.log("사용자 요청에 의한 강제 중단");
      forceStopMutation({ roomId: chatRoomId });
      setIsReceivingResponse(false);

      closeEventSource(chatRoomId);
      eventSourceRef.current = null;
    }
  };

  return {
    sseData,
    cancelChat, // 일반 중단 함수 (부분 응답 저장)
    forceStopChat, // 강제 중단 함수 (저장 안 함)
  };
};
