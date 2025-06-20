import { useShallow } from "zustand/shallow";
import { ImageItemType, useEditorImageStore } from "@/features/chatEditor/stores/EditorImageStore";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogTrigger } from "@/shared/ui/dialog";
import { ImgDialogContent } from "@/shared/components";
import { useModalStore } from "@/shared/stores/useModalStore";
import { X } from "lucide-react";

const ImageItem = ({ image }: { image: ImageItemType }) => {
  const id = `editor-image-${image.id}`;

  const removeImage = useEditorImageStore((state) => state.removeImage);
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

  const handleImgDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    removeImage(image.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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

      <ImgDialogContent imageSrc={image.url} closeCurrent={closeCurrent} />
    </Dialog>
  );
};

export default ImageItem;
