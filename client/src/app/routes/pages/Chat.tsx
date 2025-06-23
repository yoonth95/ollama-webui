import { ErrorBoundary } from "react-error-boundary";
import { useParams } from "react-router-dom";
import EditorContainer from "@/features/chatEditor/EditorContainer";
import { ArchivedEditor } from "@/features/chatEditor/components";
import ChatContainer from "@/features/chat/ChatContainer";
import { ErrorChatPage } from "@/features/chat/components";
import { useGetChatRoomDetail } from "@/features/chat/queries/useGetChatRoomDetail";

const Chat = () => {
  const { chatRoomId = "" } = useParams<{ chatRoomId?: string }>();
  const { data: chatRoomDetail, isLoading: isChatRoomDetailLoading } = useGetChatRoomDetail(chatRoomId);

  return (
    <div className="relative flex h-[calc(100vh-3rem)] w-full flex-col justify-between">
      <ErrorBoundary key={chatRoomId} FallbackComponent={ErrorChatPage}>
        <div className="flex-1 overflow-hidden">
          <ChatContainer isHome={false} chatRoomId={chatRoomId} />
        </div>
        {chatRoomDetail?.data?.isArchived ? (
          <ArchivedEditor room={chatRoomDetail.data} />
        ) : (
          <EditorContainer isChatRoomDetailLoading={isChatRoomDetailLoading} />
        )}
      </ErrorBoundary>
    </div>
  );
};

export default Chat;
