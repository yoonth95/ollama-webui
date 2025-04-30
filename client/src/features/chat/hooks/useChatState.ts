import { useEffect, useMemo, useRef } from "react";
import { useShallow } from "zustand/shallow";
import { useSSEChat } from "@/features/chat/hooks/useSSEChat";
import { useSSEEventSourceStore } from "@/shared/stores/useSSEEventSourceStore";
import { useChatOptimisticStore } from "@/shared/stores/useChatOptimisticStore";
import { ChatMessageType } from "@/shared/types/chatMessageType";

/**
 * 채팅 상태와 관련된 로직을 담당하는 훅
 * 스트리밍 응답, 재시도, API 응답 상태 등을 관리
 */
const useChatState = (roomId: string, historyChatData: ChatMessageType[], isLastBotMessage: boolean) => {
  const [isRetryLoading, isRetryCompleted, retryType, retriedAssistantId] = useChatOptimisticStore(
    useShallow((state) => [state.isRetryLoading, state.isRetryCompleted, state.retryType, state.retriedAssistantId]),
  );
  const isStartSSE = useSSEEventSourceStore((state) => state.isStartSSE);
  const { sseData, startSSEConnection } = useSSEChat({ chatRoomId: roomId });

  const lastSseDataRef = useRef(sseData);

  useEffect(() => {
    if (isRetryLoading && !isStartSSE) startSSEConnection();
  }, [isRetryLoading, isStartSSE, startSSEConnection]);

  useEffect(() => {
    if (sseData && sseData.content) lastSseDataRef.current = sseData;
  }, [sseData]);

  // API 응답으로 이미 historyChatData에 포함된 메시지인지 확인
  const isResponseAlreadyInHistory = useMemo(() => {
    if (!lastSseDataRef.current?.userMessageId) return false;

    // historyChatData의 마지막 메시지가 봇 메시지인지 확인
    const lastBotMessage = historyChatData.find(
      (message) => message.role === "assistant" && message.userMessageId === lastSseDataRef.current?.userMessageId,
    );

    return !!lastBotMessage;
  }, [historyChatData]);

  // empty 재시도 시 SSE 스트림 진행 중일 때만 표시
  const isSSEResponse = useMemo(
    () => isRetryLoading && isStartSSE && sseData && retryType === "empty",
    [isRetryLoading, isStartSSE, sseData, retryType],
  );

  // empty 재시도 후 SSE 완료되었지만 API 응답 대기 중일 때 마지막 SSE 데이터 표시
  // API 응답으로 이미 historyChatData에 포함된 메시지가 아닌 경우에만 표시
  const isLastSseDataVisible = useMemo(() => {
    return (
      isRetryCompleted &&
      !isRetryLoading &&
      retryType === "empty" &&
      lastSseDataRef.current?.content &&
      !isResponseAlreadyInHistory
    );
  }, [isRetryCompleted, isRetryLoading, retryType, isResponseAlreadyInHistory]);

  const isEmptyChat = useMemo(
    () => !isLastBotMessage && !isRetryLoading && !isRetryCompleted,
    [isLastBotMessage, isRetryLoading, isRetryCompleted],
  );

  return {
    sseData,
    lastSseDataRef,
    isRetryLoading,
    isRetryCompleted,
    retryType,
    retriedAssistantId,
    isStartSSE,
    isSSEResponse,
    isLastSseDataVisible,
    isEmptyChat,
  };
};

export default useChatState;
