import { ModelText } from "@/features/home/components";
import EditorContainer from "@/features/chatEditor/EditorContainer";
import ChatContainer from "@/features/chat/ChatContainer";
import { useChatOptimisticStore } from "@/shared/stores/useChatOptimisticStore";

export default function HomePage() {
  const isOptimistic = useChatOptimisticStore((state) => state.isOptimistic);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      {isOptimistic ? (
        <div className="flex h-full w-full flex-col justify-between">
          <ChatContainer isHome={true} chatRoomId="" />
          <EditorContainer />
        </div>
      ) : (
        <>
          <section className="mt-[-6rem] mb-6">
            <ModelText />
          </section>
          <EditorContainer />
        </>
      )}
    </div>
  );
}
