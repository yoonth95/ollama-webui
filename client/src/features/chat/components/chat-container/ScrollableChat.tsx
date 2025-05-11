import { useEffect } from "react";
import { useAtBottom, useScrollToBottom, useAnimating } from "react-scroll-to-bottom";
import { OptimisticLoading, MessageList } from "@/features/chat/components";
import { Button } from "@/shared/ui/button";
import { ChevronDown } from "lucide-react";

interface ScrollableChatPropsType {
  isHome: boolean;
  chatRoomId: string;
}

const ScrollableChat = ({ isHome, chatRoomId }: ScrollableChatPropsType) => {
  const [atBottom] = useAtBottom();
  const [isAnimating] = useAnimating();
  const scrollToBottom = useScrollToBottom();

  useEffect(() => {
    scrollToBottom({ behavior: "smooth" });
  }, [chatRoomId, scrollToBottom]);

  return (
    <>
      <div className="flex h-full w-full flex-col items-center justify-center px-3 text-base">
        <div className="flex h-full w-full flex-col md:max-w-[42rem] xl:max-w-[48rem]">
          {isHome ? <OptimisticLoading /> : <MessageList chatRoomId={chatRoomId} />}
        </div>
      </div>

      <div
        className={`absolute bottom-2 left-1/2 z-50 -translate-x-1/2 transform opacity-0 transition-opacity ${
          !isAnimating && !atBottom ? "opacity-100" : ""
        }`}
      >
        <Button
          variant="outline"
          size="icon"
          className="bg-accent dark:bg-accent dark:hover:bg-accent rounded-full"
          onClick={() => scrollToBottom({ behavior: "smooth" })}
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
      </div>
    </>
  );
};

export default ScrollableChat;
