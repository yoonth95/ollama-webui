import {
  BotMessageThinking,
  BotMessageToolbar,
  BotMessageError,
  BotMessageHeader,
  BotMessageContent,
} from "@/features/chat/components";
import useThinkContent from "@/features/chat/hooks/useThinkContent";
import { SSEChatErrorType } from "@/features/chat/types/sseChatDataType";

export interface BotMessageLayoutPropsType {
  isRetry?: boolean;
  isStartSSE?: boolean;
  isReceiving?: boolean;
  content: string;
  modelName?: string;
  createdAt?: string;
  errorType?: SSEChatErrorType;
  errorMessage?: string;
  roomId: string;
  userMessageId: string;
  answerId?: string;
  type?: "optimistic" | "regular";
}
const BotMessageLayout = ({
  isRetry,
  isStartSSE,
  isReceiving = false,
  content,
  modelName,
  createdAt,
  errorType,
  errorMessage,
  roomId,
  userMessageId,
  answerId,
}: BotMessageLayoutPropsType) => {
  const { thinkContent, mainContent, isThinking } = useThinkContent(content);
  const hasError = errorType !== undefined && errorType !== null;

  return (
    <article className="bot-message group flex w-full justify-start">
      <div className="w-full max-w-full">
        {/* 모델 이름과 생성 시간 */}
        <BotMessageHeader modelName={modelName} createdAt={createdAt} />

        {/* 추론 과정 표시 */}
        {isThinking && thinkContent && <BotMessageThinking content={thinkContent} />}

        {/* 본문 내용 */}
        {hasError ? (
          <BotMessageError
            roomId={roomId}
            userMessageId={userMessageId}
            answerId={answerId}
            errorType={errorType}
            errorMessage={errorMessage}
          />
        ) : (
          <BotMessageContent isRetry={isRetry} mainContent={mainContent} content={content} isError={false} />
        )}

        {/* 툴바 */}
        {!hasError && !isStartSSE && !isRetry && !isReceiving && (
          <BotMessageToolbar
            content={mainContent || "응답 없음."}
            answerId={answerId || ""}
            userMessageId={userMessageId || ""}
            roomId={roomId}
          />
        )}
      </div>
    </article>
  );
};

export default BotMessageLayout;
