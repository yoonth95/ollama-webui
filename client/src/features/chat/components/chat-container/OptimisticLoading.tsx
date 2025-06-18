import { useShallow } from "zustand/shallow";
import { UserMessageBox } from "@/features/chat/components";
import { useChatOptimisticStore } from "@/shared/stores/useChatOptimisticStore";
import Loader from "@/shared/ui/loader";

/**
 * 홈 페이지 Optimistic UI
 * 메시지 전송 시 유저 메시지를 표시하고 봇 응답은 로딩으로 표시
 */
const OptimisticLoading = () => {
  const [ChatDataList, isOptimistic, isCreateRoomLoading] = useChatOptimisticStore(
    useShallow((state) => [state.ChatDataList, state.isOptimistic, state.isCreateRoomLoading]),
  );

  // Optimistic UI가 활성화되지 않은 경우 (초기 상태)
  if (!isOptimistic) {
    return null;
  }

  return (
    <>
      {ChatDataList.map((chatData) =>
        chatData.role === "user" ? (
          <UserMessageBox key={chatData.id} content={chatData.content} images={chatData.images ?? []} />
        ) : null,
      )}

      {isCreateRoomLoading && (
        <div className="py-2">
          <Loader size="md" location="left" />
        </div>
      )}
    </>
  );
};

export default OptimisticLoading;
