import { ErrorBoundary } from "react-error-boundary";
import { useParams } from "react-router-dom";
import EditorContainer from "@/features/chatEditor/EditorContainer";
import { ErrorChatPage } from "@/features/chat/components";
import ChatContainer from "@/features/chat/ChatContainer";

const Chat = () => {
  const { chatRoomId = "" } = useParams<{ chatRoomId?: string }>();

  return (
    <div className="flex h-[calc(100vh-3rem)] w-full flex-col justify-between">
      <ErrorBoundary key={chatRoomId} FallbackComponent={ErrorChatPage}>
        <ChatContainer isHome={false} chatRoomId={chatRoomId} />
        <EditorContainer />
      </ErrorBoundary>
    </div>
  );
};

export default Chat;
