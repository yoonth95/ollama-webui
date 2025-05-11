import { useEffect } from "react";
import { MessageSkeleton, OptimisticRenderer, RegularRenderer } from "@/features/chat/components";
import { useGetChatMessages } from "@/features/chat/queries/useGetChatMessages";
import { useChatOptimisticStore } from "@/shared/stores/useChatOptimisticStore";
import { useSSETitle } from "@/features/chat/hooks/useSSETitle";

interface MessageListProps {
  chatRoomId: string;
  onRenderComplete?: () => void; // 추가
}

const MessageList = ({ chatRoomId, onRenderComplete }: MessageListProps) => {
  const isOptimistic = useChatOptimisticStore((state) => state.isOptimistic);
  const { data: historyMessages, isLoading, isLastBotMessage, isError } = useGetChatMessages(chatRoomId, isOptimistic);
  const { startSSEConnection: startTitleSSEConnection } = useSSETitle({ chatRoomId });

  useEffect(() => {
    if (isOptimistic) startTitleSSEConnection();
  }, [isOptimistic, startTitleSSEConnection]);

  if (isError) throw new Error("채팅 메시지 로드 오류");

  // Optimistic 모드
  if (isOptimistic) return <OptimisticRenderer roomId={chatRoomId} />;

  // 일반 모드
  if (isLoading) return <MessageSkeleton />;
  if (!historyMessages?.data?.length) return null;
  return (
    <RegularRenderer
      roomId={chatRoomId}
      historyChatData={historyMessages.data}
      isLastBotMessage={isLastBotMessage}
      onRenderComplete={onRenderComplete}
    />
  );
};

export default MessageList;
