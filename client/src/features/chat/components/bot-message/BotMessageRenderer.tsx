import { RefObject } from "react";
import { BotMessageLayout, BotSSERenderer } from "@/features/chat/components";
import { SSEChatDataType } from "@/features/chat/types/sseChatDataType";
import { ChatMessageType } from "@/shared/types/chatMessageType";

interface BotMessageProps {
  chatData: ChatMessageType;
  sseData: SSEChatDataType;
  lastSseDataRef: RefObject<SSEChatDataType>;
  roomId: string;
  isRetryLoading: boolean;
  isRetryCompleted: boolean;
  isStartSSE: boolean;
  retriedAssistantId: string | null;
  retryType: string | null;
}

/**
 * 봇 메시지 렌더링을 담당하는 컴포넌트
 * 일반 응답, 에러, 재시도 등 다양한 상태의 봇 메시지를 처리
 */
const BotMessageRenderer = ({
  chatData,
  sseData,
  lastSseDataRef,
  roomId,
  isRetryLoading,
  isRetryCompleted,
  isStartSSE,
  retriedAssistantId,
  retryType,
}: BotMessageProps) => {
  // 재시도 중인 메시지인 경우 (error 또는 regenerate)
  if (chatData.id === retriedAssistantId && (retryType === "error" || retryType === "regenerate")) {
    // 스트림 수신 중에는 실시간 SSE 데이터 표시
    if (isRetryLoading && isStartSSE) {
      return <BotSSERenderer key={`retry-${chatData.id}`} sseData={sseData} roomId={roomId} type="regular" />;
    }

    // 스트림 완료 후 API 응답 대기 중에는 마지막 SSE 데이터 유지하여 표시
    if (isRetryCompleted && !isRetryLoading && lastSseDataRef.current?.content) {
      return (
        <BotMessageLayout
          key={`last-sse-${chatData.id}`}
          isRetry={false}
          isStartSSE={false}
          content={lastSseDataRef.current.content}
          modelName={lastSseDataRef.current.model || chatData.model}
          createdAt={lastSseDataRef.current.createdAt || chatData.createdAt}
          roomId={roomId}
          userMessageId={lastSseDataRef.current.userMessageId || chatData.userMessageId || ""}
          answerId={chatData.id}
          type="regular"
        />
      );
    }

    // API 응답이 도착한 후 일반 봇 메시지 렌더링
    if (isRetryCompleted && !isRetryLoading) {
      return (
        <BotMessageLayout
          key={chatData.id}
          isRetry={false}
          isStartSSE={false}
          content={chatData.content}
          modelName={chatData.model}
          createdAt={chatData.createdAt}
          errorType={chatData.errorType || undefined}
          errorMessage={chatData.errorMessage || ""}
          roomId={roomId}
          userMessageId={chatData.userMessageId || ""}
          answerId={chatData.id}
          type="regular"
        />
      );
    }
  }

  // 일반적인 봇 메시지 렌더링
  return (
    <BotMessageLayout
      key={chatData.id}
      isRetry={false}
      isStartSSE={false}
      content={chatData.content}
      modelName={chatData.model}
      createdAt={chatData.createdAt}
      errorType={chatData.errorType || undefined}
      errorMessage={chatData.errorMessage || ""}
      roomId={roomId}
      userMessageId={chatData.userMessageId || ""}
      answerId={chatData.id}
      type="regular"
    />
  );
};

export default BotMessageRenderer;
