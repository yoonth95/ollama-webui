import { useEffect } from "react";
import { UserChatBox, BotResponseRenderer } from "@/features/chat/components";
import { useSSEChat } from "@/features/chat/hooks/useSSEChat";
import { useChatOptimisticStore } from "@/shared/stores/useChatOptimisticStore";

const ChatOptimisticRenderer = ({ roomId }: { roomId: string }) => {
  const optimisticChatDataList = useChatOptimisticStore((state) => state.ChatDataList);
  const { sseData, startSSEConnection } = useSSEChat({ chatRoomId: roomId });

  useEffect(() => {
    startSSEConnection();
  }, [startSSEConnection]);

  return (
    <>
      {optimisticChatDataList.map((chatData, index) =>
        chatData.role === "user" ? (
          <UserChatBox key={chatData.id || `user-${index}`} content={chatData.content} images={chatData.images ?? []} />
        ) : (
          <BotResponseRenderer
            key={chatData.id || `bot-${index}`}
            index={index}
            sseData={sseData}
            roomId={roomId}
            type="optimistic"
          />
        ),
      )}
    </>
  );
};

export default ChatOptimisticRenderer;
