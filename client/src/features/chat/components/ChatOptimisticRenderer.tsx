import { userChatDataType } from "@/shared/stores/useChatOptimisticStore";
import { useSSEEventSourceStore } from "@/shared/stores/useSSEEventSourceStore";
import { BotChatError, BotChatLayout, UserChatBox, BotChatHeader } from "@/features/chat/components";
import { SSEChatDataType } from "@/features/chat/types/sseChatDataType";
import { LoaderCircle } from "lucide-react";

interface ChatOptimisticRendererPropsType {
  sseData: SSEChatDataType;
  userChatData: userChatDataType;
  roomId: string;
}
const ChatOptimisticRenderer = ({ sseData, userChatData, roomId }: ChatOptimisticRendererPropsType) => {
  const isStartSSE = useSSEEventSourceStore((state) => state.isStartSSE);

  return (
    <>
      {userChatData.content && <UserChatBox content={userChatData.content} images={userChatData.images ?? []} />}

      {sseData.error ? (
        <article className="bot-message group flex w-full flex-col justify-start">
          <BotChatHeader modelName={sseData.model} createdAt={sseData.createdAt} />
          <BotChatError
            roomId={roomId}
            userMessageId={sseData.userMessageId}
            answerId={sseData.answerId}
            errorType={sseData.errorType}
            errorMessage={sseData.errorMessage}
          />
        </article>
      ) : isStartSSE && !sseData.content ? (
        <div className="py-2">
          <LoaderCircle className="h-6 w-6 animate-spin" />
        </div>
      ) : sseData.content ? (
        <BotChatLayout
          isRetry={sseData.isRetry}
          isStartSSE={isStartSSE}
          content={sseData.content}
          modelName={sseData.model || ""}
          createdAt={sseData.createdAt || ""}
          roomId={roomId}
          userMessageId={sseData.userMessageId}
          answerId={sseData.answerId}
        />
      ) : null}
    </>
  );
};

export default ChatOptimisticRenderer;
