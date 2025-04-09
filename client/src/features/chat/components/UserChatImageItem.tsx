import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogDescription, DialogTitle } from "@/shared/ui/dialog";
import { ImageDataType } from "@/shared/types/chatMessageType";

const ChatImageItem = ({ image }: { image: ImageDataType }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="dark:bg-card bg-accent hover:bg-border flex cursor-pointer items-center gap-3 rounded-lg transition-colors duration-200 hover:dark:bg-[#1e1e1e]">
          <img
            src={`data:${image.mimeType};base64,${image.data}`}
            alt="채팅 이미지"
            className="h-full max-h-48 w-fit max-w-48 overflow-hidden rounded-lg object-cover object-center"
          />
        </div>
      </DialogTrigger>

      <DialogContent
        className="gap-0 border-none bg-transparent"
        isCloseButton={false}
        style={{ maxWidth: "none" }}
        onClick={() => setIsOpen(false)}
      >
        <DialogTitle />
        <DialogDescription />
        <div className="flex h-full w-full items-center justify-center">
          <img
            src={`data:${image.mimeType};base64,${image.data}`}
            alt="이미지 미리보기"
            className="max-h-[calc(100vh-10rem)] cursor-pointer rounded-xl object-contain shadow lg:w-fit"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatImageItem;
