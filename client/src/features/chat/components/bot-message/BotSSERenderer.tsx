import { BotMessageError, BotMessageLayout, BotMessageHeader } from "@/features/chat/components";
import { SSEChatDataType } from "@/features/chat/types/sseChatDataType";
import { useSSEEventSourceStore } from "@/shared/stores/useSSEEventSourceStore";
import { ChatMessageType } from "@/shared/types/chatMessageType";
import Loader from "@/shared/ui/loader";

interface BotSSERendererPropsType {
  answerData?: ChatMessageType;
  index?: number;
  sseData: SSEChatDataType;
  roomId: string;
  type: "optimistic" | "regular";
}

const BotSSERenderer = ({ answerData, index = 0, sseData, roomId, type }: BotSSERendererPropsType) => {
  const isStartSSE = useSSEEventSourceStore((state) => state.isStartSSE["chat"] ?? false);

  // 오류 발생
  if (sseData.error) {
    return (
      <article
        key={answerData?.id || `bot-error-${index}`}
        className="bot-message group flex w-full flex-col justify-start"
      >
        <BotMessageHeader modelName={sseData.model} createdAt={sseData.createdAt} />
        <BotMessageError
          roomId={roomId}
          userMessageId={sseData.userMessageId}
          answerId={sseData.answerId}
          errorType={sseData.errorType}
          errorMessage={sseData.errorMessage}
        />
      </article>
    );
  }

  // 답변 로딩
  if (isStartSSE && !sseData.content) {
    return (
      <div key={answerData?.id || `bot-loading-${index}`} className="py-2">
        <Loader size="md" location="left" />
      </div>
    );
  }

  // 답변 시작
  if (sseData.content) {
    return (
      <BotMessageLayout
        key={answerData?.id || `bot-content-${index}`}
        isRetry={sseData.isRetry}
        isStartSSE={true}
        isReceiving={true}
        content={sseData.content}
        modelName={sseData.model || ""}
        createdAt={sseData.createdAt || ""}
        roomId={roomId}
        userMessageId={sseData.userMessageId}
        answerId={sseData.answerId}
        type={type}
      />
    );
  }

  return (
    <div key={answerData?.id || `bot-initial-loading-${index}`} className="py-2">
      <Loader size="md" location="left" />
    </div>
  );
};

export default BotSSERenderer;
