import { useEffect, useCallback, useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { BotChatEmpty, BotChatLayout, BotResponseRenderer, UserChatBox } from "@/features/chat/components";
import { useSSEChat } from "@/features/chat/hooks/useSSEChat";
import { useSSEEventSourceStore } from "@/shared/stores/useSSEEventSourceStore";
import { useChatOptimisticStore } from "@/shared/stores/useChatOptimisticStore";
import { ChatMessageType } from "@/shared/types/chatMessageType";

interface ChatRegularRendererPropsType {
  roomId: string;
  historyChatData: ChatMessageType[];
  isLastBotMessage: boolean;
}

const ChatRegularRenderer = ({ roomId, historyChatData, isLastBotMessage }: ChatRegularRendererPropsType) => {
  const [isRetryLoading, isRetryCompleted, retryType, retriedAssistantId] = useChatOptimisticStore(
    useShallow((state) => [state.isRetryLoading, state.isRetryCompleted, state.retryType, state.retriedAssistantId]),
  );
  const isStartSSE = useSSEEventSourceStore((state) => state.isStartSSE);
  const { sseData, startSSEConnection } = useSSEChat({ chatRoomId: roomId });

  useEffect(() => {
    if (isRetryLoading && !isStartSSE) startSSEConnection();
  }, [isRetryLoading, isStartSSE, startSSEConnection]);

  const BotMessageList = useCallback(
    (chatData: ChatMessageType) => {
      // 재시도 중인 메시지인 경우 (error 또는 regenerate)
      if (
        isRetryLoading &&
        chatData.id === retriedAssistantId &&
        (retryType === "error" || retryType === "regenerate")
      ) {
        return <BotResponseRenderer key={`retry-${chatData.id}`} sseData={sseData} roomId={roomId} type="regular" />;
      }

      // 일반적인 봇 메시지 렌더링
      return (
        <BotChatLayout
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
    },
    [roomId, isRetryLoading, retriedAssistantId, retryType, sseData],
  );

  const renderedHistoryMessages = useMemo(
    () =>
      historyChatData.map((chatData) =>
        chatData.role === "user" ? (
          <UserChatBox key={chatData.id} content={chatData.content} images={chatData.images ?? []} />
        ) : (
          BotMessageList(chatData)
        ),
      ),
    [historyChatData, BotMessageList],
  );

  const isSSEResponse = useMemo(
    () => isRetryLoading && !isRetryCompleted && sseData && retryType === "empty",
    [isRetryLoading, isRetryCompleted, sseData, retryType],
  );

  const isEmptyChat = useMemo(
    () => !isLastBotMessage && !isRetryLoading && !isRetryCompleted,
    [isLastBotMessage, isRetryLoading, isRetryCompleted],
  );

  return (
    <>
      {renderedHistoryMessages}

      {/* empty 재시도 - 마지막 메시지가 빈 경우 실시간 텍스트 렌더링 */}
      {isSSEResponse && <BotResponseRenderer sseData={sseData} roomId={roomId} type="regular" />}

      {/* 마지막 질문에 답변하지 못한 경우 */}
      {isEmptyChat && <BotChatEmpty roomId={roomId} />}
    </>
  );
};

export default ChatRegularRenderer;
