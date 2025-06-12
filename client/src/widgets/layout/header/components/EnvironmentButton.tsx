import SettingContent from "@/widgets/settings-modal/SettingContent";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui/dialog";
import { Separator } from "@/shared/ui/separator";
import { useDialogVisibility } from "@/shared/stores/dialogVisibility";
import { Settings } from "lucide-react";

const EnvironmentButton = () => {
  const isSettingsVisible = useDialogVisibility((value) => value.isSettingsVisible);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" aria-label="dropdown" className="p-0 text-lg">
          <Settings />
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "gap-0 rounded-2xl p-0",
          "dark:text-foreground text-foreground",
          "bg-background dark:bg-neutral-800",
          isSettingsVisible ? "block" : "hidden",
        )}
      >
        <DialogHeader className="flex flex-row items-center justify-between p-4">
          <DialogTitle className="text-lg font-bold">설정</DialogTitle>
          <DialogDescription className="sr-only">설정 메뉴입니다.</DialogDescription>
        </DialogHeader>
        <Separator className="bg-sidebar-ring !h-[0.5px]" />

        <SettingContent />
      </DialogContent>
    </Dialog>
  );
};

export default EnvironmentButton;
