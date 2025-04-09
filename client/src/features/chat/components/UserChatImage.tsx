import { UserChatImageItem } from "@/features/chat/components";
import { ImageDataType } from "@/shared/types/chatMessageType";

const UserChatImage = ({ images }: { images?: ImageDataType[] }) => {
  if (!images || images.length === 0) return null;

  return (
    <div className="max-w-[100%] px-3 sm:max-w-[90%] md:max-w-[80%]">
      <div className="flex flex-row flex-wrap items-center justify-end gap-1">
        {images.map((image) => (
          <UserChatImageItem key={image.id} image={image} />
        ))}
      </div>
    </div>
  );
};

export default UserChatImage;
