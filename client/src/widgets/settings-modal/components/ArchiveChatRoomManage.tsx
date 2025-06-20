import { useShallow } from "zustand/shallow";
import ArchiveManageContent from "@/widgets/settings-modal/components/archive-manage/ArchiveManageContent";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogClose,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/shared/ui/dialog";
import { Separator } from "@/shared/ui/separator";
import { Button } from "@/shared/ui/button";
import { useModalStore } from "@/shared/stores/useModalStore";
import { cn } from "@/shared/lib/utils";
import { XIcon } from "lucide-react";

const ArchiveChatRoomManage = () => {
  const id = "archive-manage";

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
        <Button
          variant="outline"
          className="dark:border-sidebar-ring dark:hover:bg-sidebar-ring/40 border-sidebar-ring h-10 rounded-3xl border"
        >
          <span>관리</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        isCloseButton={false}
        className={cn(
          "sm:max-w-[90%] md:max-w-[80%]",
          "gap-0 rounded-2xl p-0",
          "dark:text-foreground text-foreground",
          "bg-background dark:bg-neutral-800",
          "ring-0 ring-offset-0 outline-none",
        )}
      >
        <DialogHeader className="flex flex-row items-center justify-between px-6 py-8">
          <div>
            <DialogTitle>보관된 채팅</DialogTitle>
            <DialogDescription />
          </div>
          <DialogClose
            onClick={(e) => e.stopPropagation()}
            className="cursor-pointer opacity-70 transition-opacity hover:opacity-100 [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        <Separator className="bg-sidebar-ring !h-[0.5px]" />
        <div className="flex w-full flex-col gap-2 px-6 py-8" onWheel={(e) => e.stopPropagation()}>
          <ArchiveManageContent />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArchiveChatRoomManage;
