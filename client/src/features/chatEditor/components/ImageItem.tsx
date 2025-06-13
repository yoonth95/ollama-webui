import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/shared/ui/dialog";
import { ImageItemType, useEditorImageStore } from "@/features/chatEditor/stores/EditorImageStore";
import { X } from "lucide-react";

const ImageItem = ({ image }: { image: ImageItemType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const removeImage = useEditorImageStore((state) => state.removeImage);

  const handleImgDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    removeImage(image.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="dark:bg-card bg-accent hover:bg-border border-input flex cursor-pointer items-center gap-3 rounded-lg border transition-colors duration-200 hover:dark:bg-[#1e1e1e]">
          <img
            src={image.url}
            alt="에디터 이미지"
            className="dark:border-card h-10 w-10 min-w-10 rounded-l-lg object-cover dark:border"
          />
          <div className="mr-2 ml-[-12px] flex h-10 w-full items-center gap-2 pl-3">
            <span className="text-sm">{image.file.type}</span>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-muted h-6 w-6 rounded-full transition-colors duration-150 dark:hover:bg-[#3a3a3a]"
              onClick={handleImgDelete}
            >
              <X />
            </Button>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent
        className="gap-0 border-none bg-transparent outline-none"
        isCloseButton={false}
        style={{ maxWidth: "none" }}
        onClick={() => setIsOpen(false)}
      >
        <DialogTitle />
        <DialogDescription />
        <div className="flex h-full w-full items-center justify-center">
          <img
            src={image.url}
            alt="이미지 미리보기"
            className="max-h-[calc(100vh-10rem)] cursor-pointer rounded-xl object-contain shadow lg:w-fit"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageItem;
