import { Button } from "@/shared/ui/button";
import { LoaderCircle, Send } from "lucide-react";

interface ChatSendButtonPropsType {
  hasValidContent: boolean;
  isPending: boolean;
  onSubmit: () => void;
}
const ChatSendButton = ({ hasValidContent, isPending, onSubmit }: ChatSendButtonPropsType) => (
  <div className="flex w-full items-center justify-end px-3 py-3">
    <Button
      type="submit"
      variant="ghost"
      size="icon"
      aria-label="메시지 보내기"
      className="h-8 w-8 rounded-full bg-foreground text-background hover:bg-foreground/70 hover:text-background hover:dark:bg-muted-foreground hover:dark:text-background"
      onClick={onSubmit}
      disabled={isPending || !hasValidContent}
    >
      {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
    </Button>
  </div>
);

export default ChatSendButton;
