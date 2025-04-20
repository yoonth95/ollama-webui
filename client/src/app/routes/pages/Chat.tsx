import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useParams } from "react-router-dom";
import { useChatOptimisticStore } from "@/shared/stores/useChatOptimisticStore";
import EditorContainer from "@/features/chatEditor/EditorContainer";
import { ErrorChatPage } from "@/features/chat/components";
import ChatContainer from "@/features/chat/ChatContainer";

const Chat = () => {
  const { chatRoomId = "" } = useParams<{ chatRoomId?: string }>();
  const setIsReceivingResponse = useChatOptimisticStore((state) => state.setIsReceivingResponse);

  // 채팅방 이동 시 상태 초기화
  useEffect(() => {
    // 응답 수신 상태 초기화
    setIsReceivingResponse(false);
  }, [chatRoomId, setIsReceivingResponse]);

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
