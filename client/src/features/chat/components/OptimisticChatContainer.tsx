import { useParams, useNavigate } from "react-router-dom";
import { useChatUIStore } from "@/shared/stores/useChatUIStore";
import { UserChatBox, BotChatError } from "@/features/chat/components";
import { useSSEConnection } from "@/features/chat/hooks/useSSEConnection";
import { LoaderCircle } from "lucide-react";
import BotChatLayout from "@/features/chat/components/BotChatLayout";

const OptimisticChatContainer = () => {
  const navigate = useNavigate();
  const { chatRoomId } = useParams<{ chatRoomId?: string }>();
  const { pendingUserMessage, pendingUserImages, hasError, botResponse, isLoading, modelName, createdAt } =
    useChatUIStore();

  // SSE 연결 훅 사용 - reconnect 함수도 가져옴
  const { reconnect } = useSSEConnection(chatRoomId);

  return (
    <section className="themed-scrollbar flex w-full justify-center overflow-y-auto">
      <div className="flex w-full flex-col gap-4 text-base md:max-w-[42rem] md:gap-5 lg:gap-6 xl:max-w-[48rem]">
        {/* 사용자 메시지 */}
        <UserChatBox content={pendingUserMessage} images={pendingUserImages} />

        {/* 봇 응답 상태에 따라 다른 컴포넌트 렌더링 */}
        {hasError ? (
          <BotChatError onRetry={() => reconnect()} onNewChat={() => navigate("/")} />
        ) : isLoading && !botResponse ? (
          <LoaderCircle className="h-6 w-6 animate-spin" />
        ) : botResponse ? (
          <BotChatLayout content={botResponse} modelName={modelName || undefined} createdAt={createdAt || undefined} />
        ) : null}
        <br />
      </div>
    </section>
  );
};

export default OptimisticChatContainer;
