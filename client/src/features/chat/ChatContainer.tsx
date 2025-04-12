import { ChatOptimisticUI } from "@/features/chat/components";
import ChatMessageList from "@/features/chat/components/ChatMessageList";

interface ChatContainerPropsType {
  isHome: boolean;
  chatRoomId: string;
}

/**
 * 채팅 컨테이너 컴포넌트
 * - 홈 페이지: ChatOptimisticUI 표시
 * - 채팅방 페이지: ChatMessageList 표시
 */
const ChatContainer = ({ isHome, chatRoomId }: ChatContainerPropsType) => {
  return (
    <section className="themed-scrollbar flex w-full justify-center overflow-y-auto">
      <div className="flex w-full flex-col px-3 text-base md:max-w-[42rem] xl:max-w-[48rem]">
        {isHome ? <ChatOptimisticUI /> : <ChatMessageList chatRoomId={chatRoomId} />}

        {/* 이후 채팅 메시지 데이터 추가 */}
      </div>
    </section>
  );
};

export default ChatContainer;
