import { useShallow } from "zustand/shallow";
import { Button } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/components";
import { useModalStore } from "@/shared/stores/useModalStore";
import { cn } from "@/shared/lib/utils";

export type SettingActionType = "archive" | "delete";

interface SettingActionPropsType {
  type: SettingActionType;
  buttonText: string;
  buttonClassName?: string;
  title: string;
  description: string;
  confirmText: string;
  confirmColor: string;
  onAction: () => void;
}

const SettingAction = ({
  type,
  buttonText,
  buttonClassName,
  title,
  description,
  confirmText,
  confirmColor,
  onAction,
}: SettingActionPropsType) => {
  const id = title.replace(/\s+/g, "-").toLowerCase();

  const { open, closeCurrent, isOpen } = useModalStore(
    useShallow((state) => ({
      open: state.open,
      closeCurrent: state.closeCurrent,
      isOpen: state.isOpen(id),
    })),
  );

  const handleOpenChange = (openState: boolean) => {
    if (openState) open({ id, type: "alert" });
    else closeCurrent();
  };

  const handleAction = () => {
    onAction();
    closeCurrent();
  };

  const defaultButtonClass =
    "dark:border-sidebar-ring dark:hover:bg-sidebar-ring/40 border-sidebar-ring h-10 rounded-3xl border";
  const deleteButtonClass =
    "h-10 rounded-3xl bg-red-500 hover:bg-red-800 dark:bg-red-500 dark:hover:bg-red-800 dark:text-foreground text-background hover:text-background";

  const getButtonClassName = () => {
    if (buttonClassName) return buttonClassName;
    return type === "delete" ? deleteButtonClass : defaultButtonClass;
  };

  return (
    <>
      <Button variant="outline" className={cn(getButtonClassName())} onClick={() => open({ id, type: "alert" })}>
        <span>{buttonText}</span>
      </Button>
      <ConfirmDialog
        title={title}
        description={description}
        open={isOpen}
        onOpenChange={handleOpenChange}
        hasOverlay={false}
        onConfirm={handleAction}
        confirmText={confirmText}
        confirmColor={confirmColor}
      />
    </>
  );
};

export default SettingAction;
