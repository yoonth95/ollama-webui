import { ErrorBoundary } from "react-error-boundary";
import { useParams } from "react-router-dom";
import EditorContainer from "@/features/chatEditor/EditorContainer";
import ChatContainer from "@/features/chat/ChatContainer";
import { ErrorChatPage } from "@/features/chat/components";
import { Button } from "@/shared/ui/button";
import { useScrollToBottom } from "@/shared/hooks/useScrollToBottom";
import { ChevronDown } from "lucide-react";
// import { useCallback } from "react";

const Chat = () => {
  const { chatRoomId = "" } = useParams<{ chatRoomId?: string }>();
  const { containerRef, isBottom, scrollToBottomSmooth, scrollToBottomInstant } = useScrollToBottom(chatRoomId);

  return (
    <div className="relative flex h-[calc(100vh-3rem)] w-full flex-col justify-between">
      <ErrorBoundary key={chatRoomId} FallbackComponent={ErrorChatPage}>
        <div className="flex-1 overflow-hidden">
          <ChatContainer
            containerRef={containerRef}
            isHome={false}
            chatRoomId={chatRoomId}
            onRenderComplete={scrollToBottomInstant}
          />
        </div>
        <EditorContainer />
        {/* 맨 처음 스켈레톤 뜨기 직전에 버튼이 보이기 시작함 */}
        <div
          className={`absolute bottom-32 left-1/2 z-50 -translate-x-1/2 transform opacity-0 transition-opacity ${!isBottom ? "opacity-100" : ""}`}
        >
          <Button
            variant="outline"
            size="icon"
            className="bg-accent dark:bg-accent dark:hover:bg-accent rounded-full"
            onClick={() => scrollToBottomSmooth()}
          >
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default Chat;
