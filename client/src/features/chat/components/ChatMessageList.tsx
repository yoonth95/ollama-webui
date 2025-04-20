import { useEffect } from "react";
import { useShallow } from "zustand/shallow";
import {
  BotChatLayout,
  ChatMessageSkeleton,
  UserChatBox,
  BotChatEmpty,
  ChatOptimisticRenderer,
} from "@/features/chat/components";
import { useGetChatMessages } from "@/features/chat/queries/useGetChatMessages";
import { useSSEChat } from "@/features/chat/hooks/useSSEChat";
import { SSEChatErrorType } from "@/features/chat/types/sseChatDataType";
import { useChatOptimisticStore } from "@/shared/stores/useChatOptimisticStore";
import { ChatMessageType } from "@/shared/types/chatMessageType";

const ChatMessageList = ({ chatRoomId }: { chatRoomId: string }) => {
  const [userChatData, isOptimistic, isReceivingResponse, deactivateOptimisticUI, setIsReceivingResponse] =
    useChatOptimisticStore(
      useShallow((state) => [
        state.userChatData,
        state.isOptimistic,
        state.isReceivingResponse,
        state.deactivateOptimisticUI,
        state.setIsReceivingResponse,
      ]),
    );

  const { data: historyMessages, isLoading, isLastBotMessage } = useGetChatMessages(chatRoomId, isOptimistic);

  // 일반 모드에서 채팅 히스토리 로드 완료 시 optimistic 모드 해제
  useEffect(() => {
    if (!isLoading && historyMessages?.data && historyMessages.data.length > 0 && isOptimistic) {
      deactivateOptimisticUI();
    }
  }, [isLoading, historyMessages, isOptimistic, deactivateOptimisticUI]);

  const { sseData } = useSSEChat({
    chatRoomId,
    isOptimistic,
    setIsReceivingResponse,
  });

  // Optimistic 모드
  if (isOptimistic) {
    return (
      <ChatOptimisticRenderer sseData={sseData} userChatData={userChatData} isReceivingResponse={isReceivingResponse} />
    );
  }

  // 일반 모드 (메시지 히스토리 API 호출)
  return (
    <>
      {isLoading ? (
        <ChatMessageSkeleton />
      ) : (
        <>
          {historyMessages?.data?.map((message: ChatMessageType) =>
            message.role === "user" ? (
              <UserChatBox key={message.id} content={message.content} images={message.images ?? []} />
            ) : (
              <BotChatLayout
                key={message.id}
                content={message.content}
                modelName={message.model}
                createdAt={message.createdAt}
                errorType={message.errorType as SSEChatErrorType}
                errorMessage={message.errorMessage || ""}
              />
            ),
          )}
          {!isLastBotMessage && <BotChatEmpty />}
        </>
      )}
    </>
  );
};

export default ChatMessageList;
