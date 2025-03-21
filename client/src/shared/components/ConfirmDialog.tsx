import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";

interface ConfirmDialogProps {
  title: string;
  description: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
}

const ConfirmDialog = ({
  title,
  description,
  open,
  onOpenChange,
  onConfirm,
  confirmText = "확인",
  cancelText = "취소",
  confirmColor = "bg-red-500 hover:bg-red-600 dark:bg-red-500 hover:dark:bg-red-600",
}: ConfirmDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-1">
          <AlertDialogCancel className="rounded-3xl border dark:border-neutral-700 dark:bg-transparent dark:hover:bg-neutral-700/70">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction className={`rounded-3xl text-white ${confirmColor}`} onClick={onConfirm}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDialog;
