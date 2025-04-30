import { UserMessageImage, UserMessageContent } from "@/features/chat/components";
import { ImageDataType } from "@/shared/types/chatMessageType";

const UserMessageBox = ({ content, images }: { content: string; images?: ImageDataType[] }) => {
  return (
    <article className="user-message flex w-full flex-col items-end gap-2">
      <UserMessageImage images={images} />
      <UserMessageContent content={content} />
    </article>
  );
};

export default UserMessageBox;
