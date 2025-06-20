import { useShallow } from "zustand/shallow";
import { Dialog, DialogTrigger } from "@/shared/ui/dialog";
import { ImgDialogContent } from "@/shared/components";
import { useModalStore } from "@/shared/stores/useModalStore";
import { ImageDataType } from "@/shared/types/chatMessageType";

const ChatImageItem = ({ image }: { image: ImageDataType }) => {
  const id = `chat-image-${image.id}`;
  const { open, closeCurrent, isOpen } = useModalStore(
    useShallow((state) => ({
      open: state.open,
      closeCurrent: state.closeCurrent,
      isOpen: state.isOpen(id),
    })),
  );

  const handleOpenChange = (openState: boolean) => {
    if (openState) open({ id, type: "dialog" });
    else closeCurrent();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <div className="dark:bg-card bg-accent hover:bg-border flex cursor-pointer items-center gap-3 rounded-lg transition-colors duration-200 hover:dark:bg-[#1e1e1e]">
          <img
            src={`data:${image.mimeType};base64,${image.data}`}
            alt="채팅 이미지"
            className="h-full max-h-48 w-fit max-w-48 overflow-hidden rounded-lg object-cover object-center"
          />
        </div>
      </DialogTrigger>

      <ImgDialogContent imageSrc={`data:${image.mimeType};base64,${image.data}`} closeCurrent={closeCurrent} />
    </Dialog>
  );
};

export default ChatImageItem;
