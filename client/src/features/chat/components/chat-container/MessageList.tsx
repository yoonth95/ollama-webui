import { MessageSkeleton, OptimisticRenderer, RegularRenderer } from "@/features/chat/components";
import { useGetChatMessages } from "@/features/chat/queries/useGetChatMessages";
import { useChatOptimisticStore } from "@/shared/stores/useChatOptimisticStore";

const MessageList = ({ chatRoomId }: { chatRoomId: string }) => {
  const isOptimistic = useChatOptimisticStore((state) => state.isOptimistic);
  const { data: historyMessages, isLoading, isLastBotMessage, isError } = useGetChatMessages(chatRoomId, isOptimistic);

  if (isError) throw new Error("채팅 메시지 로드 오류");

  // Optimistic 모드
  if (isOptimistic) return <OptimisticRenderer roomId={chatRoomId} />;

  // 일반 모드
  if (isLoading) return <MessageSkeleton />;
  if (!historyMessages?.data?.length) return null;
  return (
    <RegularRenderer roomId={chatRoomId} historyChatData={historyMessages.data} isLastBotMessage={isLastBotMessage} />
  );
};

export default MessageList;
