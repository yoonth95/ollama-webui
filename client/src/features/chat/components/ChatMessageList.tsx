import { useEffect } from "react";
import { useShallow } from "zustand/shallow";
import { BotChatLayout, ChatMessageSkeleton, UserChatBox } from "@/features/chat/components";
import { useGetChatMessages } from "@/features/chat/queries/useGetChatMessages";
import { useSSEChat } from "@/features/chat/hooks/useSSEChat";
import { useChatOptimisticStore } from "@/shared/stores/useChatOptimisticStore";
import { ChatMessageType } from "@/shared/types/chatMessageType";
import { AlertCircle, LoaderCircle } from "lucide-react";

/**
 * 채팅 메시지 목록 컴포넌트
 * - 홈에서 이동한 경우(optimistic 모드): 사용자가 입력한 메시지와 SSE로 받은 봇 응답 표시
 * - 일반적인 접근(일반 모드): 채팅 히스토리 API로 받은 전체 메시지 표시
 */
const ChatMessageList = ({ chatRoomId }: { chatRoomId: string }) => {
  const [userChatData, isOptimistic, deactivateOptimisticUI, setIsReceivingResponse, isReceivingResponse] =
    useChatOptimisticStore(
      useShallow((state) => [
        state.userChatData,
        state.isOptimistic,
        state.deactivateOptimisticUI,
        state.setIsReceivingResponse,
        state.isReceivingResponse,
      ]),
    );

  const { data: historyMessages, isLoading } = useGetChatMessages(chatRoomId, isOptimistic);

  // 일반 모드에서 채팅 히스토리 로드 완료 시 optimistic 모드 해제
  useEffect(() => {
    if (!isLoading && historyMessages?.data && historyMessages.data.length > 0 && isOptimistic) {
      deactivateOptimisticUI();
    }
  }, [isLoading, historyMessages, isOptimistic, deactivateOptimisticUI]);

  const { sseData } = useSSEChat({
    chatRoomId,
    isOptimistic,
    setIsReceivingResponse,
  });

  // Optimistic
  if (isOptimistic) {
    return (
      <>
        {userChatData.content && <UserChatBox content={userChatData.content} images={userChatData.images ?? []} />}

        {sseData.error ? (
          <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            <AlertCircle className="h-5 w-5" />
            <span>{sseData.errorMessage || "응답을 받는 중 오류가 발생했습니다"}</span>
          </div>
        ) : isReceivingResponse && !sseData.response ? (
          <div className="py-2">
            <LoaderCircle className="h-6 w-6 animate-spin" />
          </div>
        ) : sseData.response ? (
          <BotChatLayout
            content={sseData.response}
            modelName={sseData.model || ""}
            createdAt={sseData.createdAt || ""}
          />
        ) : null}
      </>
    );
  }

  // 일반
  return (
    <>
      {!isOptimistic && isLoading ? (
        <ChatMessageSkeleton />
      ) : (
        historyMessages?.data?.map((message: ChatMessageType) =>
          message.role === "user" ? (
            <UserChatBox key={message.id} content={message.content} images={message.images ?? []} />
          ) : (
            <BotChatLayout
              key={message.id}
              content={message.content}
              modelName={message.model}
              createdAt={message.createdAt}
            />
          ),
        )
      )}
    </>
  );
};

export default ChatMessageList;
