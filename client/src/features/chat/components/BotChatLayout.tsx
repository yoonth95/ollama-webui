import {
  BotThinkingBox,
  BotChatToolbar,
  BotChatError,
  BotChatHeader,
  BotChatContent,
} from "@/features/chat/components";
import useThinkContent from "@/features/chat/hooks/useThinkContent";
import { SSEChatErrorType } from "@/features/chat/types/sseChatDataType";

export interface BotChatLayoutPropsType {
  isRetry?: boolean;
  content: string;
  modelName?: string;
  createdAt?: string;
  errorType?: SSEChatErrorType;
  errorMessage?: string;
  roomId: string;
  userMessageId: string;
  answerId?: string;
}
const BotChatLayout = ({
  isRetry,
  content,
  modelName,
  createdAt,
  errorType,
  errorMessage,
  roomId,
  userMessageId,
  answerId,
}: BotChatLayoutPropsType) => {
  const { thinkContent, mainContent, isThinking } = useThinkContent(content);
  const hasError = errorType && errorMessage;

  return (
    <article className="bot-message group flex w-full justify-start">
      <div className="w-full max-w-full">
        {/* 모델 이름과 생성 시간 */}
        <BotChatHeader modelName={modelName} createdAt={createdAt} />

        {/* 추론 과정 표시 */}
        {isThinking && thinkContent && <BotThinkingBox content={thinkContent} />}

        {/* 본문 내용 */}
        {hasError ? (
          <BotChatError
            roomId={roomId}
            userMessageId={userMessageId}
            answerId={answerId}
            errorType={errorType}
            errorMessage={errorMessage}
          />
        ) : (
          <BotChatContent isRetry={isRetry} mainContent={mainContent} content={content} isError={Boolean(hasError)} />
        )}

        {/* 툴바 */}
        {!hasError && !isRetry && <BotChatToolbar content={mainContent || "응답 없음."} />}
      </div>
    </article>
  );
};

export default BotChatLayout;
