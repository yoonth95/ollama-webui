import { Button } from "@/shared/ui/button";
import { TooltipContainer } from "@/shared/components";
import { useEditorImageStore } from "@/features/chatEditor/stores/EditorImageStore";
import { LoaderCircle, Send } from "lucide-react";

interface ChatSendButtonPropsType {
  hasValidContent: boolean;
  isPending: boolean;
  onSubmit: () => void;
}
const ChatSendButton = ({ hasValidContent, isPending, onSubmit }: ChatSendButtonPropsType) => {
  const images = useEditorImageStore((state) => state.images);

  return (
    <TooltipContainer message="메시지 보내기">
      <Button
        variant="ghost"
        size="icon"
        aria-label="메시지 보내기"
        className="bg-foreground text-background hover:bg-foreground/70 hover:text-background hover:dark:bg-muted-foreground hover:dark:text-background h-8 w-8 rounded-full"
        onClick={onSubmit}
        disabled={isPending || (!hasValidContent && images.length === 0)}
      >
        {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </Button>
    </TooltipContainer>
  );
};

export default ChatSendButton;
