import { Suspense } from "react";
import { useParams } from "react-router-dom";
import EditorContainer from "@/features/chatEditor/EditorContainer";
import ChatContainer from "@/features/chat/ChatContainer";

const Chat = () => {
  const { chatRoomId = "" } = useParams<{ chatRoomId?: string }>();
  console.log(chatRoomId);

  return (
    <div className="flex h-[calc(100vh-3rem)] w-full flex-col">
      <Suspense fallback={<div>메시지 로딩 중...</div>}>
        <ChatContainer chatRoomId={chatRoomId} />
      </Suspense>
      <EditorContainer />
    </div>
  );
};

export default Chat;
