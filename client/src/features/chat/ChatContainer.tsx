import { OptimisticLoading, MessageList } from "@/features/chat/components";

interface ChatContainerPropsType {
  isHome: boolean;
  chatRoomId: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onRenderComplete?: () => void; // 추가
}

const ChatContainer = ({ isHome, chatRoomId, containerRef, onRenderComplete }: ChatContainerPropsType) => {
  return (
    <section ref={containerRef} className="themed-scrollbar relative flex h-full w-full justify-center overflow-y-auto">
      <div className="flex h-full w-full flex-col px-3 text-base md:max-w-[42rem] xl:max-w-[48rem]">
        {isHome ? <OptimisticLoading /> : <MessageList chatRoomId={chatRoomId} onRenderComplete={onRenderComplete} />}
      </div>
    </section>
  );
};

export default ChatContainer;
