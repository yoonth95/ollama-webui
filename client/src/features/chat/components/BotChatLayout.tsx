import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import MarkdownViewer from "@/features/markdown/MarkdownViewer";
import { BotThinkingBox, BotChatToolbar, BotChatError } from "@/features/chat/components";
import useThinkContent from "@/features/chat/hooks/useThinkContent";
import { SSEChatErrorType } from "@/features/chat/types/sseChatDataType";
import { LoaderCircle } from "lucide-react";

interface BotChatLayoutPropsType {
  isRetry?: boolean;
  content: string;
  modelName?: string;
  createdAt?: string;
  errorType?: SSEChatErrorType;
  errorMessage?: string;
}
const BotChatLayout = ({ isRetry, content, modelName, createdAt, errorType, errorMessage }: BotChatLayoutPropsType) => {
  const { thinkContent, mainContent, isThinking } = useThinkContent(content);
  const isError = errorType && errorMessage;

  return (
    <article className="bot-message group flex w-full justify-start">
      <div className="w-full max-w-full">
        <div className="text-accent-foreground-70 mb-2 flex items-center gap-3">
          {modelName && <span className="font-medium">{modelName}</span>}
          {createdAt && (
            <span className="text-xs opacity-0 transition-opacity group-hover:opacity-100">
              {typeof createdAt === "string"
                ? formatDistanceToNow(new Date(createdAt), { locale: ko, addSuffix: true })
                : formatDistanceToNow(createdAt, { locale: ko, addSuffix: true })}
            </span>
          )}
        </div>

        {/* 추론 과정 표시 */}
        {isThinking && thinkContent && <BotThinkingBox content={thinkContent} />}

        {/* 본문 내용 */}
        {mainContent || content ? (
          <div className="flex items-center py-2">
            {isRetry && <LoaderCircle className="h-5 w-5 animate-spin" />}
            <div className="px-2 break-words">
              <MarkdownViewer content={mainContent} />
            </div>
          </div>
        ) : !content && !isError ? (
          <div className="w-fit py-2">
            <i>응답 없음.</i>
          </div>
        ) : isError ? (
          <BotChatError errorType={errorType} errorMessage={errorMessage} />
        ) : null}

        <BotChatToolbar content={mainContent || errorMessage || "응답 없음."} />
      </div>
    </article>
  );
};

export default BotChatLayout;
