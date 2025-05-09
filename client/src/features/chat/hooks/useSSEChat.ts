import { useState, useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/shallow";
import useChatCancel from "@/features/chat/queries/useChatCancel";
import { SSEChatDataType } from "@/features/chat/types/sseChatDataType";
import { useSSEEventSourceStore } from "@/shared/stores/useSSEEventSourceStore";
import { useChatOptimisticStore } from "@/shared/stores/useChatOptimisticStore";
import { queryKeys } from "@/shared/api";

/**
 * 채팅방 SSE 연결을 관리하는 훅
 * @param chatRoomId 채팅방 ID
 * @returns SSE 응답 데이터와 상태, 중단 함수들
 */
interface UseSSEChatPropsType {
  chatRoomId: string;
}

const SSE_TYPE = "chat" as const;

export const useSSEChat = ({ chatRoomId }: UseSSEChatPropsType) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const isConnectingRef = useRef<boolean>(false);

  const [sseData, setSseData] = useState<SSEChatDataType>({
    isReceiving: false,
    content: "",
    userMessageId: "",
  });

  const queryClient = useQueryClient();

  const { mutate: regularCancelMutation } = useChatCancel(false);
  const { mutate: forceStopMutation } = useChatCancel(true);

  const [deactivateOptimisticUI, setIsRetryLoading, setIsRetryCompleted] = useChatOptimisticStore(
    useShallow((state) => [state.deactivateOptimisticUI, state.setIsRetryLoading, state.setIsRetryCompleted]),
  );

  // SSE 이벤트 소스 스토어
  const [isStartSSE, setIsStartSSE, addEventSource, closeEventSource, getEventSource] = useSSEEventSourceStore(
    useShallow((state) => [
      state.isStartSSE[SSE_TYPE] ?? false,
      state.setIsStartSSE,
      state.addEventSource,
      state.closeEventSource,
      state.getEventSource,
    ]),
  );

  const cleanupConnection = useCallback(() => {
    if (chatRoomId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.messages(chatRoomId) });
      closeEventSource(SSE_TYPE, chatRoomId);
      setIsStartSSE(SSE_TYPE, false);
      deactivateOptimisticUI();
      setIsRetryLoading(false);
      setIsRetryCompleted(true);

      // 스트리밍 데이터는 초기화하지 않고 isReceiving 상태만 변경 (UI 깜박임 방지)
      setSseData((prev) => ({ ...prev, isReceiving: false }));
      eventSourceRef.current = null;
      isConnectingRef.current = false;
    }
  }, [
    chatRoomId,
    queryClient,
    closeEventSource,
    setIsStartSSE,
    deactivateOptimisticUI,
    setIsRetryLoading,
    setIsRetryCompleted,
  ]);

  const startSSEConnection = useCallback(() => {
    // 이미 연결 중이거나 채팅방 ID가 없는 경우 무시
    if (isConnectingRef.current || !chatRoomId) return;

    isConnectingRef.current = true;

    const existingEventSource = getEventSource(SSE_TYPE, chatRoomId);
    if (existingEventSource) {
      console.log(`[${chatRoomId}/${SSE_TYPE}] 이미 연결되어 있음`);
      return;
    }

    setIsStartSSE(SSE_TYPE, true);

    // 새 스트림 시작 시 초기화
    setSseData({ isReceiving: true, content: "", userMessageId: "" });
  }, [chatRoomId, getEventSource, setIsStartSSE]);

  useEffect(() => {
    // 채팅방 ID가 없거나 SSE 연결 시작 상태가 아닌 경우 연결하지 않음
    if (!chatRoomId || !isStartSSE) return;

    // 이미 EventSource가 있는지 확인
    if (getEventSource(SSE_TYPE, chatRoomId)) return;

    // SSE 연결
    const eventSource = new EventSource(`/api/v1/chat/stream/${chatRoomId}`);
    eventSourceRef.current = eventSource;
    isConnectingRef.current = true;

    // 스토어에 EventSource 추가
    addEventSource(SSE_TYPE, chatRoomId, eventSource);

    // 연결 성공
    eventSource.addEventListener("connected", (event) => {
      console.log("chat SSE 연결 성공:", event.data);
      isConnectingRef.current = false;
    });

    // 메시지
    eventSource.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);

        const responseData = {
          isRetry: false,
          isReceiving: true,
          content: data.full,
          model: data.model,
          createdAt: data.created_at,
          userMessageId: data.user_message_id,
          answerId: data.answer_id,
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

          // 연결 종료는 상태 업데이트 후 비동기적으로 처리하여 UI 깜빡임 방지
          setTimeout(() => {
            cleanupConnection();
          }, 100);
        }
      } catch (error) {
        console.error(`${chatRoomId} SSE chat 파싱 오류:`, error);
        regularCancelMutation({ roomId: chatRoomId });
        cleanupConnection();
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
          model: errorData.model || "",
          createdAt: errorData.created_at || "",
          userMessageId: errorData.user_message_id || "",
          answerId: errorData.answer_id || "",
        });

        console.error(`${chatRoomId} SSE 오류:`, errorData.message || "메시지를 받는 중 오류가 발생했습니다");

        // 오류 발생 시에도 UI 깜빡임 방지를 위해 약간 지연 후 연결 종료
        setTimeout(() => {
          cleanupConnection();
        }, 100);
      } catch {
        // 기본 오류 처리
        setSseData({
          isReceiving: false,
          content: "",
          error: true,
          errorType: "CONNECTION",
          errorMessage: "연결 중 오류가 발생했습니다",
          model: "",
          createdAt: "",
          userMessageId: "",
          answerId: "",
        });

        console.error(`${chatRoomId} 서버 연결 중 오류가 발생했습니다`);
        regularCancelMutation({ roomId: chatRoomId });

        // 연결 종료
        setTimeout(() => {
          cleanupConnection();
        }, 100);
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
        model: "",
        createdAt: "",
        userMessageId: "",
        answerId: "",
      });

      console.warn(`${chatRoomId} 연결 시간이 초과되었습니다`);
      regularCancelMutation({ roomId: chatRoomId });
      cleanupConnection();
    });

    // 비활성 이벤트
    eventSource.addEventListener("inactive", () => {
      setSseData({
        isReceiving: false,
        content: "",
        userMessageId: "",
        answerId: "",
      });

      console.info(`${chatRoomId} 장시간 활동이 없어 연결이 종료되었습니다`);
      forceStopMutation({ roomId: chatRoomId });
      cleanupConnection();
    });

    // 핑-퐁 이벤트 (서버 연결 유지용)
    eventSource.addEventListener("ping", () => {
      // 핑 이벤트 수신 시 특별한 처리 없음 (서버 연결 유지 목적)
    });

    // 컴포넌트 언마운트 또는 의존성 변경 시 연결 종료
    return () => {
      if (eventSourceRef.current) {
        closeEventSource(SSE_TYPE, chatRoomId);
        setIsRetryLoading(false);
        eventSourceRef.current = null;
        isConnectingRef.current = false;
        console.log(`${chatRoomId} 컴포넌트 언마운트 시 SSE 연결 종료`);
      }
    };
  }, [
    chatRoomId,
    isStartSSE,
    regularCancelMutation,
    forceStopMutation,
    addEventSource,
    closeEventSource,
    cleanupConnection,
    getEventSource,
    setIsRetryLoading,
  ]);

  const cancelChat = () => {
    if (chatRoomId) {
      console.log(`${chatRoomId} 사용자 요청에 의한 일반 중단`);
      regularCancelMutation({ roomId: chatRoomId });
      cleanupConnection();
    }
  };

  const forceStopChat = () => {
    if (chatRoomId) {
      console.log(`${chatRoomId} 사용자 요청에 의한 강제 중단`);
      forceStopMutation({ roomId: chatRoomId });
      cleanupConnection();
    }
  };

  return {
    sseData,
    cancelChat, // 일반 중단 함수 (부분 응답 저장)
    forceStopChat, // 강제 중단 함수 (저장 안 함)
    startSSEConnection, // SSE 연결 시작 함수 - 외부에서 재연결 시 사용 가능
  };
};
