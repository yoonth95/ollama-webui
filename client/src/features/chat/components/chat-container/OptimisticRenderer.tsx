import { useEffect } from "react";
import { UserMessageBox, BotSSERenderer } from "@/features/chat/components";
import { useSSEChat } from "@/features/chat/hooks/useSSEChat";
import { useChatOptimisticStore } from "@/shared/stores/useChatOptimisticStore";

const OptimisticRenderer = ({ roomId }: { roomId: string }) => {
  const optimisticChatDataList = useChatOptimisticStore((state) => state.ChatDataList);
  const { sseData, startSSEConnection } = useSSEChat({ chatRoomId: roomId });

  useEffect(() => {
    startSSEConnection();
  }, [startSSEConnection]);

  return (
    <>
      {optimisticChatDataList.map((chatData, index) =>
        chatData.role === "user" ? (
          <UserMessageBox
            key={chatData.id || `user-${index}`}
            content={chatData.content}
            images={chatData.images ?? []}
          />
        ) : (
          <BotSSERenderer
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

export default OptimisticRenderer;
