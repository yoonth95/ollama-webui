import { ErrorBoundary } from "react-error-boundary";
import { useParams } from "react-router-dom";
import EditorContainer from "@/features/chatEditor/EditorContainer";
import ChatContainer from "@/features/chat/ChatContainer";
import { ErrorChatPage } from "@/features/chat/components";
import OptimisticChatContainer from "@/features/chat/components/OptimisticChatContainer";
import { useChatUIStore } from "@/shared/stores/useChatUIStore";

const Chat = () => {
  const { chatRoomId = "" } = useParams<{ chatRoomId?: string }>();
  const { isOptimisticChatActive, pendingChatRoomId } = useChatUIStore();

  const shouldUseOptimisticUI = isOptimisticChatActive && pendingChatRoomId === chatRoomId;

  return (
    <div className="flex h-[calc(100vh-3rem)] w-full flex-col justify-between">
      <ErrorBoundary key={chatRoomId} FallbackComponent={ErrorChatPage}>
        {shouldUseOptimisticUI ? <OptimisticChatContainer /> : <ChatContainer chatRoomId={chatRoomId} />}
        <EditorContainer />
      </ErrorBoundary>
    </div>
  );
};

export default Chat;
