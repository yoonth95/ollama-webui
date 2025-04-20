import { useEffect } from "react";
import { useChatOptimisticStore } from "@/shared/stores/useChatOptimisticStore";
import { ModelText } from "@/features/home/components";
import EditorContainer from "@/features/chatEditor/EditorContainer";
import ChatContainer from "@/features/chat/ChatContainer";

export default function HomePage() {
  const isOptimistic = useChatOptimisticStore((state) => state.isOptimistic);
  const setIsReceivingResponse = useChatOptimisticStore((state) => state.setIsReceivingResponse);

  // 홈 페이지 진입 시 상태 초기화
  useEffect(() => {
    // 응답 수신 상태 초기화
    setIsReceivingResponse(false);
  }, [setIsReceivingResponse]);

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
