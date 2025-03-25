import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { downloadModel } from "@/widgets/layout/header/apis";
import { useModelDownload } from "@/widgets/layout/header/hooks";
import { queryKeys } from "@/shared/api";

interface UseModelDownloadHandlerProps {
  modelName: string;
  onSuccess?: () => void;
}

export const useModelDownloadHandler = ({ modelName, onSuccess }: UseModelDownloadHandlerProps) => {
  const queryClient = useQueryClient();

  const { isPending, downloadProgress, startDownload, updateProgress, finishOrCancelDownload, getController } =
    useModelDownload(modelName);

  const handleDownload = async () => {
    const controller = startDownload();

    try {
      const { ok, message, detail } = await downloadModel({
        modelName,
        updateProgress,
        controller,
      });

      if (ok) {
        if (detail !== "cancel") {
          queryClient.invalidateQueries({ queryKey: queryKeys.models.list() });
          toast.success(message);
          onSuccess?.();
        }
      } else {
        if (detail === "aleady") {
          queryClient.invalidateQueries({ queryKey: queryKeys.models.list() });
        }
        toast.error(message);
      }
    } finally {
      finishOrCancelDownload();
    }
  };

  return {
    isPending,
    downloadProgress,
    controller: getController(),
    handleDownload,
  };
};
