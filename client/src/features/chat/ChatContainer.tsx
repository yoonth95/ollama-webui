import ScrollToBottom from "react-scroll-to-bottom";
import { ScrollableChat } from "@/features/chat/components";

interface ChatContainerPropsType {
  isHome: boolean;
  chatRoomId: string;
}
const ChatContainer = ({ isHome, chatRoomId }: ChatContainerPropsType) => {
  return (
    <section className="relative h-full w-full">
      <ScrollToBottom
        className="themed-scrollbar relative flex h-full w-full justify-center overflow-y-auto"
        followButtonClassName="hidden"
      >
        <ScrollableChat isHome={isHome} chatRoomId={chatRoomId} />
      </ScrollToBottom>
    </section>
  );
};

export default ChatContainer;
