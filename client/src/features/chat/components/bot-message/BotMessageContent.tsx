import MarkdownViewer from "@/features/markdown/MarkdownViewer";
import Loader from "@/shared/ui/loader";

const BotMessageContent = ({
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
        {isRetry && <Loader size="sm" location="left" />}
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

export default BotMessageContent;
