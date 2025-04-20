import MarkdownViewer from "@/features/markdown/MarkdownViewer";
import { LoaderCircle } from "lucide-react";

const BotChatContent = ({
  isRetry,
  mainContent,
  content,
  isError,
}: {
  isRetry?: boolean;
  mainContent: string;
  content: string;
  isError: boolean;
}) => {
  const shouldShowContent = mainContent || content;
  const shouldShowEmptyState = !content && !isError;

  if (shouldShowContent) {
    return (
      <div className="flex items-center py-2">
        {isRetry && <LoaderCircle className="h-5 w-5 animate-spin" />}
        <div className="px-2 break-words">
          <MarkdownViewer content={mainContent} />
        </div>
      </div>
    );
  }

  if (shouldShowEmptyState) {
    return (
      <div className="w-fit py-2">
        <i>응답 없음.</i>
      </div>
    );
  }

  return null;
};

export default BotChatContent;
