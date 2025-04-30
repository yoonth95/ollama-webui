import { useCallback, useMemo } from "react";
import {
  BotChatEmpty,
  BotChatLayout,
  BotResponseRenderer,
  UserChatBox,
  BotMessageRenderer,
} from "@/features/chat/components";
import { ChatMessageType } from "@/shared/types/chatMessageType";
import useChatState from "@/features/chat/hooks/useChatState";

interface ChatRegularRendererPropsType {
  roomId: string;
  historyChatData: ChatMessageType[];
  isLastBotMessage: boolean;
}

/**
 * 일반 채팅 렌더링을 담당하는 컴포넌트
 * 채팅 이력, 재시도 및 빈 챗 상태를 처리
 */
const ChatRegularRenderer = ({ roomId, historyChatData, isLastBotMessage }: ChatRegularRendererPropsType) => {
  const {
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
  } = useChatState(roomId, historyChatData, isLastBotMessage);

  // 메시지 렌더링 콜백
  const renderMessage = useCallback(
    (chatData: ChatMessageType) => {
      if (chatData.role === "user") {
        return <UserChatBox key={chatData.id} content={chatData.content} images={chatData.images ?? []} />;
      }

      return (
        <BotMessageRenderer
          key={chatData.id}
          chatData={chatData}
          sseData={sseData}
          lastSseDataRef={lastSseDataRef}
          roomId={roomId}
          isRetryLoading={isRetryLoading}
          isRetryCompleted={isRetryCompleted}
          isStartSSE={isStartSSE}
          retriedAssistantId={retriedAssistantId}
          retryType={retryType}
        />
      );
    },
    [roomId, isRetryLoading, isRetryCompleted, isStartSSE, retriedAssistantId, retryType, sseData, lastSseDataRef],
  );

  // 모든 기록 메시지 렌더링
  const renderedHistoryMessages = useMemo(() => historyChatData.map(renderMessage), [historyChatData, renderMessage]);

  return (
    <>
      {renderedHistoryMessages}

      {/* empty 재시도 - 마지막 메시지가 빈 경우 실시간 텍스트 렌더링 */}
      {isSSEResponse && <BotResponseRenderer sseData={sseData} roomId={roomId} type="regular" />}

      {/* empty 재시도 후 SSE 완료 & API 응답 대기 중일 때 마지막 SSE 데이터 유지 */}
      {isLastSseDataVisible && (
        <BotChatLayout
          key="last-sse-empty"
          isRetry={false}
          isStartSSE={false}
          content={lastSseDataRef.current.content}
          modelName={lastSseDataRef.current.model || ""}
          createdAt={lastSseDataRef.current.createdAt || ""}
          roomId={roomId}
          userMessageId={lastSseDataRef.current.userMessageId || ""}
          answerId={lastSseDataRef.current.answerId || ""}
          type="regular"
        />
      )}

      {/* 마지막 질문에 답변하지 못한 경우 */}
      {isEmptyChat && <BotChatEmpty roomId={roomId} />}
    </>
  );
};

export default ChatRegularRenderer;
