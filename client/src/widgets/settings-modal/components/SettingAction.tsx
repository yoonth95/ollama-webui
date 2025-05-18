import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/components";
import { useDialogVisibility } from "@/shared/stores/dialogVisibility";
import { cn } from "@/shared/lib/utils";

export type SettingActionType = "archive" | "manage" | "delete";

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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const setSettingsVisible = useDialogVisibility((value) => value.setSettingsVisible);

  useEffect(() => {
    setSettingsVisible(!showConfirmDialog);
  }, [showConfirmDialog, setSettingsVisible]);

  const handleAction = () => {
    onAction();
    setShowConfirmDialog(false);
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
      <Button variant="outline" className={cn(getButtonClassName())} onClick={() => setShowConfirmDialog(true)}>
        <span>{buttonText}</span>
      </Button>
      <ConfirmDialog
        title={title}
        description={description}
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleAction}
        confirmText={confirmText}
        confirmColor={confirmColor}
      />
    </>
  );
};

export default SettingAction;
