import { useCustomMutation } from "@/shared/hooks/useApiQuery";

export const useDeleteModel = (modelName: string) => {
  return useCustomMutation({
    endpoint: `/model/delete/${modelName}`,
    method: "DELETE",
  });
};
