import { useEffect } from "react";
import { useShallow } from "zustand/shallow";
import { useChatOptimisticStore } from "@/shared/stores/useChatOptimisticStore";
import { ModelText } from "@/features/home/components";
import EditorContainer from "@/features/chatEditor/EditorContainer";
import ChatContainer from "@/features/chat/ChatContainer";

export default function HomePage() {
  const [isOptimistic, deactivateOptimisticUI] = useChatOptimisticStore(
    useShallow((state) => [state.isOptimistic, state.deactivateOptimisticUI]),
  );

  // 홈 페이지 진입 시 optimistic 해제
  useEffect(() => {
    deactivateOptimisticUI();
  }, [deactivateOptimisticUI]);

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
