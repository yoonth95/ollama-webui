"use client";

import { KeyboardEventHandler, useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";

interface EditDialogProps {
  title: string;
  inputValue?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (value: string) => void;
  confirmText?: string;
  cancelText?: string;
}

const EditDialog = ({ title, inputValue = "", open, onOpenChange, onConfirm, confirmText = "확인" }: EditDialogProps) => {
  const [value, setValue] = useState(inputValue);

  const handleConfirm = () => {
    onConfirm(value);
    onOpenChange(false);
  };

  const handleEnter: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Input value={value} className="dark:bg-accent" onChange={(e) => setValue(e.target.value)} onKeyDown={handleEnter} />
        <DialogFooter className="flex justify-end space-x-2">
          <Button
            type="button"
            className="rounded-3xl border dark:border-neutral-700 dark:bg-white dark:text-background dark:hover:bg-white/80"
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditDialog;
