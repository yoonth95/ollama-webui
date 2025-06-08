import { useEffect, useState } from "react";
import ArchiveManageContent from "@/widgets/settings-modal/components/archive-manage/ArchiveManageContent";
import { cn } from "@/shared/lib/utils";
import { useDialogVisibility } from "@/shared/stores/dialogVisibility";
import { Dialog, DialogContent, DialogHeader, DialogClose, DialogTitle, DialogTrigger } from "@/shared/ui/dialog";
import { Separator } from "@/shared/ui/separator";
import { Button } from "@/shared/ui/button";
import { XIcon } from "lucide-react";

const ArchiveChatRoomManage = () => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const setSettingsVisible = useDialogVisibility((value) => value.setSettingsVisible);

  useEffect(() => {
    setSettingsVisible(!showConfirmDialog);
  }, [showConfirmDialog, setSettingsVisible]);

  return (
    <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
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
        hasOverlay={false}
        className={cn(
          "sm:max-w-[90%] md:max-w-[80%]",
          "gap-0 rounded-2xl p-0",
          "dark:text-foreground text-foreground",
          "bg-background dark:bg-neutral-800",
          "ring-0 ring-offset-0 outline-none",
        )}
      >
        <DialogHeader className="flex flex-row items-center justify-between px-6 py-8">
          <DialogTitle>보관된 채팅</DialogTitle>
          <DialogClose
            onClick={() => setShowConfirmDialog(false)}
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
