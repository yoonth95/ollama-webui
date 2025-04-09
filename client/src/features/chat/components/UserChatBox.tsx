import { UserChatImage, UserChatContent } from "@/features/chat/components";
import { ImageDataType } from "@/shared/types/chatMessageType";

const UserChatBox = ({ content, images }: { content: string; images?: ImageDataType[] }) => {
  return (
    <article className="user-message flex w-full flex-col items-end gap-2">
      <UserChatImage images={images} />
      <UserChatContent content={content} />
    </article>
  );
};

export default UserChatBox;
