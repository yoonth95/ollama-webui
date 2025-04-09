import { UserChatBox, BotChatBox } from "@/features/chat/components";
import { useGetChatMessages } from "./queries/useGetChatMessages";

const ChatContainer = ({ chatRoomId }: { chatRoomId: string }) => {
  const { data: messagesResponse } = useGetChatMessages(chatRoomId);

  return (
    <section className="themed-scrollbar flex w-full justify-center overflow-y-auto">
      <div className="flex w-full flex-col gap-4 text-base md:max-w-[42rem] md:gap-5 lg:gap-6 xl:max-w-[48rem]">
        {messagesResponse.data?.map((message) =>
          message.role === "user" ? (
            <UserChatBox key={message.id} content={message.content} images={message.images ?? []} />
          ) : (
            <BotChatBox key={message.id} content={message.content} />
          ),
        )}
        <br />
      </div>
    </section>
  );
};

export default ChatContainer;
