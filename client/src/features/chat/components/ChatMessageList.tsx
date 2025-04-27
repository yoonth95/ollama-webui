import { ChatMessageSkeleton, ChatOptimisticRenderer, ChatRegularRenderer } from "@/features/chat/components";
import { useGetChatMessages } from "@/features/chat/queries/useGetChatMessages";
import { useChatOptimisticStore } from "@/shared/stores/useChatOptimisticStore";

const ChatMessageList = ({ chatRoomId }: { chatRoomId: string }) => {
  const isOptimistic = useChatOptimisticStore((state) => state.isOptimistic);
  const { data: historyMessages, isLoading, isLastBotMessage, isError } = useGetChatMessages(chatRoomId, isOptimistic);

  if (isError) throw new Error("채팅 메시지 로드 오류");

  // Optimistic 모드
  if (isOptimistic) return <ChatOptimisticRenderer roomId={chatRoomId} />;

  // 일반 모드
  if (isLoading) return <ChatMessageSkeleton />;
  if (!historyMessages?.data?.length) return null;
  return (
    <ChatRegularRenderer
      roomId={chatRoomId}
      historyChatData={historyMessages.data}
      isLastBotMessage={isLastBotMessage}
    />
  );
};

export default ChatMessageList;
