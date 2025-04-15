import { useShallow } from "zustand/shallow";
import { useChatOptimisticStore } from "@/shared/stores/useChatOptimisticStore";
import { UserChatBox } from "@/features/chat/components";
import { LoaderCircle } from "lucide-react";

/**
 * 홈 페이지 Optimistic UI
 * 메시지 전송 시 유저 메시지를 표시하고 봇 응답은 로딩으로 표시
 */
const ChatOptimisticUI = () => {
  const [userChatData, isOptimistic, isCreateRoomLoading] = useChatOptimisticStore(
    useShallow((state) => [state.userChatData, state.isOptimistic, state.isCreateRoomLoading]),
  );

  // Optimistic UI가 활성화되지 않은 경우 (초기 상태)
  if (!isOptimistic) {
    return null;
  }

  return (
    <>
      {userChatData.content && <UserChatBox content={userChatData.content} images={userChatData.images ?? []} />}

      {isCreateRoomLoading && (
        <div className="py-2">
          <LoaderCircle className="h-6 w-6 animate-spin" />
        </div>
      )}
    </>
  );
};

export default ChatOptimisticUI;
