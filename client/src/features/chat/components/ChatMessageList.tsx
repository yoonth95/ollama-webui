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
  const [userChatData, isOptimistic] = useChatOptimisticStore(
    useShallow((state) => [state.userChatData, state.isOptimistic]),
  );

  const { data: historyMessages, isLoading, isLastBotMessage, isError } = useGetChatMessages(chatRoomId, isOptimistic);

  // sse 연결 및 데이터 가져오기
  const { sseData } = useSSEChat({ chatRoomId });

  if (isError) throw new Error("채팅 메시지 로드 오류");

  // Optimistic 모드
  if (isOptimistic) {
    return <ChatOptimisticRenderer sseData={sseData} userChatData={userChatData} roomId={chatRoomId} />;
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
                roomId={chatRoomId}
                userMessageId={message.userMessageId ?? ""}
                answerId={message.id ?? undefined}
              />
            ),
          )}
          {!isLastBotMessage && <BotChatEmpty roomId={chatRoomId} />}
        </>
      )}
    </>
  );
};

export default ChatMessageList;
