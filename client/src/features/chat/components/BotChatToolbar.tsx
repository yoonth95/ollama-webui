import { useCopyToClipboard } from "react-use";
import { Button } from "@/shared/ui/button";
import TooltipContainer from "@/shared/components/TooltipContainer";
import { Copy, RefreshCw } from "lucide-react";

const BotChatToolbar = ({ content }: { content: string }) => {
  const [, copy] = useCopyToClipboard();

  return (
    <div className="text-accent-foreground-70 flex items-center gap-3 py-2">
      <TooltipContainer message="복사">
        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copy(content)}>
          <Copy className="h-4 w-4" />
        </Button>
      </TooltipContainer>

      <TooltipContainer message="재시도">
        <Button variant="ghost" size="icon" className="h-5 w-5">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </TooltipContainer>
    </div>
  );
};

export default BotChatToolbar;
