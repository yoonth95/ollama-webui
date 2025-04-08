import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useParams } from "react-router-dom";
import EditorContainer from "@/features/chatEditor/EditorContainer";
import ChatContainer from "@/features/chat/ChatContainer";
import { ChatMessageSkeleton, ErrorChatPage } from "@/features/chat/components";

const Chat = () => {
  const { chatRoomId = "" } = useParams<{ chatRoomId?: string }>();

  return (
    <div className="flex h-[calc(100vh-3rem)] w-full flex-col justify-between">
      <ErrorBoundary key={chatRoomId} FallbackComponent={ErrorChatPage}>
        <Suspense fallback={<ChatMessageSkeleton />}>
          <ChatContainer chatRoomId={chatRoomId} />
        </Suspense>
        <EditorContainer />
      </ErrorBoundary>
    </div>
  );
};

export default Chat;
