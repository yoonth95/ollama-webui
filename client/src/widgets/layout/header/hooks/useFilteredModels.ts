import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { GetModelResponseType, ModelInfoType } from "@/shared/types/modelType";
import { queryKeys } from "@/shared/api";
import modelData from "@/shared/data/modelData.json";

type ModelList = {
  [key: string]: ModelInfoType[];
};

export const useFilteredModels = () => {
  const queryClient = useQueryClient();
  const response = queryClient.getQueryData<GetModelResponseType>(queryKeys.models.list());
  const models = response?.data || [];
  const availableModelNames = models.map((m) => m.model);

  return useMemo((): ModelList => {
    const filtered: ModelList = {};
    Object.entries(modelData).forEach(([category, models]) => {
      const available = models.filter((model) => !availableModelNames.includes(model.model));
      if (available.length > 0) filtered[category] = available;
    });
    return filtered;
  }, [availableModelNames]);
};
