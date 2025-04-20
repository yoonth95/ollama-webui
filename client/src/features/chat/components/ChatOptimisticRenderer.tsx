import { BotChatError, BotChatLayout, UserChatBox } from "@/features/chat/components";
import { userChatDataType } from "@/shared/stores/useChatOptimisticStore";
import { SSEChatDataType } from "@/features/chat/types/sseChatDataType";
import { LoaderCircle } from "lucide-react";

interface ChatOptimisticRendererPropsType {
  sseData: SSEChatDataType;
  userChatData: userChatDataType;
  isReceivingResponse: boolean;
}
const ChatOptimisticRenderer = ({ sseData, userChatData, isReceivingResponse }: ChatOptimisticRendererPropsType) => {
  return (
    <>
      {userChatData.content && <UserChatBox content={userChatData.content} images={userChatData.images ?? []} />}

      {sseData.error ? (
        <BotChatError errorType={sseData.errorType} errorMessage={sseData.errorMessage} />
      ) : isReceivingResponse && !sseData.content ? (
        <div className="py-2">
          <LoaderCircle className="h-6 w-6 animate-spin" />
        </div>
      ) : sseData.content ? (
        <BotChatLayout
          isRetry={sseData.isRetry}
          content={sseData.content}
          modelName={sseData.model || ""}
          createdAt={sseData.createdAt || ""}
        />
      ) : null}
    </>
  );
};

export default ChatOptimisticRenderer;
