import { useCustomMutation } from "@/shared/api";

export const useDeleteModel = (modelName: string) => {
  return useCustomMutation({
    endpoint: `/model/delete/${modelName}`,
    method: "DELETE",
  });
};
