import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Button } from "@/shared/ui/button";
import { useDeleteModel } from "@/widgets/layout/header/queries";
import { queryKeys } from "@/shared/api";
import { Trash2 } from "lucide-react";

const DeleteModelButton = ({ model }: { model: string }) => {
  const deleteModelMutation = useDeleteModel(model);
  const queryClient = useQueryClient();

  const handleModelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();

    deleteModelMutation.mutate(undefined, {
      onSuccess: (data) => {
        if (data.ok) {
          toast.success(data.message);
          queryClient.invalidateQueries({ queryKey: queryKeys.models.list() });
        } else {
          toast.error(data.message);
        }
      },
    });
  };

  return (
    <Button
      variant="ghost"
      aria-label="delete-model"
      onClick={handleModelDelete}
      disabled={deleteModelMutation.isPending}
      className="h-4 w-4 rounded p-0 hover:bg-neutral-200 dark:hover:bg-transparent"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
};

export default DeleteModelButton;
