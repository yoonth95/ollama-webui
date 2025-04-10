import { useEffect } from "react";
import { ModelText } from "@/features/home/components";
import EditorContainer from "@/features/chatEditor/EditorContainer";
import { useChatUIStore } from "@/shared/stores/useChatUIStore";
import OptimisticChatContainer from "@/features/chat/components/OptimisticChatContainer";

export default function HomePage() {
  const { isOptimisticChatActive, deactivateOptimisticUI, pendingChatRoomId } = useChatUIStore();

  // 홈 페이지 마운트 시 채팅방 ID가 없으면 Optimistic UI 상태 초기화
  useEffect(() => {
    // 페이지가 마운트되었을 때 pendingChatRoomId가 없으면 상태 초기화
    if (!pendingChatRoomId) {
      deactivateOptimisticUI();
    }
  }, [deactivateOptimisticUI, pendingChatRoomId]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      {isOptimisticChatActive ? (
        <div className="flex h-full w-full flex-col justify-between">
          <OptimisticChatContainer />
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
