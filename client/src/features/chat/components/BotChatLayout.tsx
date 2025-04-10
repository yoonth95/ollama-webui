import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import MarkdownViewer from "@/features/markdown/MarkdownViewer";
import { BotThinkingBox } from "@/features/chat/components";

interface BotChatLayoutProps {
  content: string;
  modelName?: string;
  createdAt?: string | Date;
}

const BotChatLayout = ({ content, modelName, createdAt }: BotChatLayoutProps) => {
  let thinkContent = "";
  let mainContent = content;

  // <think></think> 태그 파싱
  const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
  if (thinkMatch && thinkMatch[1]) {
    thinkContent = thinkMatch[1].trim();
    mainContent = content.replace(/<think>[\s\S]*?<\/think>/, "").trim();
  }

  return (
    <article className="bot-message group flex w-full justify-start">
      <div className="w-full max-w-full px-3">
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

        {/* 생각 콘텐츠 */}
        {thinkContent && <BotThinkingBox content={thinkContent} />}

        {/* 메인 콘텐츠 */}
        <div className="px-2 py-2 break-words">
          <MarkdownViewer content={mainContent} />
        </div>
      </div>
    </article>
  );
};

export default BotChatLayout;
