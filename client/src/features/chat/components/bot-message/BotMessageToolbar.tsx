import { useCopyToClipboard } from "react-use";
import useMessageRetry from "@/features/chat/queries/useMessageRetry";
import { Button } from "@/shared/ui/button";
import TooltipContainer from "@/shared/components/TooltipContainer";
import { useChatOptimisticStore } from "@/shared/stores/useChatOptimisticStore";
import { Copy, RefreshCw } from "lucide-react";

interface BotMessageToolbarPropsType {
  content: string;
  answerId: string;
  userMessageId: string;
  roomId: string;
}
const BotMessageToolbar = ({ content, answerId, userMessageId, roomId }: BotMessageToolbarPropsType) => {
  const [, copy] = useCopyToClipboard();
  const { mutate: retryMessageMutation } = useMessageRetry(roomId);
  const setRetryInfo = useChatOptimisticStore((state) => state.setRetryInfo);

  const handleRetryMessage = () => {
    setRetryInfo(answerId || "", "regenerate");
    retryMessageMutation({
      roomId,
      userMessageId: userMessageId || "",
      answerId: answerId || "",
      isErrorRetry: false,
    });
  };

  return (
    <div className="text-accent-foreground-70 flex items-center gap-3 py-2">
      <TooltipContainer message="복사">
        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copy(content)}>
          <Copy className="h-4 w-4" />
        </Button>
      </TooltipContainer>

      <TooltipContainer message="재시도">
        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleRetryMessage}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </TooltipContainer>
    </div>
  );
};

export default BotMessageToolbar;
