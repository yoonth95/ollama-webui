import { useEffect } from "react";
import { UserChatBox, BotChatLayout, ChatMessageSkeleton } from "@/features/chat/components";
import { useGetChatMessages } from "@/features/chat/queries/useGetChatMessages";
import { useChatUIStore } from "@/shared/stores/useChatUIStore";

const ChatContainer = ({ chatRoomId }: { chatRoomId: string }) => {
  const { data: messagesResponse, isLoading } = useGetChatMessages(chatRoomId);
  const { deactivateOptimisticUI } = useChatUIStore();

  // 일반 ChatContainer가 마운트되면 Optimistic UI 상태 초기화
  useEffect(() => {
    deactivateOptimisticUI();
  }, [deactivateOptimisticUI]);

  return (
    <section className="themed-scrollbar flex w-full justify-center overflow-y-auto">
      <div className="flex w-full flex-col gap-4 text-base md:max-w-[42rem] md:gap-5 lg:gap-6 xl:max-w-[48rem]">
        {isLoading ? (
          <ChatMessageSkeleton />
        ) : (
          messagesResponse?.data?.map((message) =>
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
        <br />
      </div>
    </section>
  );
};

export default ChatContainer;
