import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@/shared/ui/dropdown-menu";
import { SubMenuItem } from "@/widgets/layout/header/ui";
import { GetModelResponseType, ModelInfoType } from "@/shared/types/modelType";
import modelData from "@/shared/data/modelData.json";

type ModelList = {
  [key: string]: ModelInfoType[];
};
const DownloadableModels = () => {
  const queryClient = useQueryClient();
  const response = queryClient.getQueryData<GetModelResponseType>(["models"]);
  const models = response?.data || [];
  const availableModelNames = models.map((m) => m.model);

  // 다운로드 가능한 모델 필터링
  const filterModels = useMemo((): ModelList => {
    const filtered: ModelList = {};
    Object.entries(modelData).forEach(([category, models]) => {
      const available = models.filter((model) => !availableModelNames.includes(model.model));
      if (available.length > 0) filtered[category] = available;
    });
    return filtered;
  }, [availableModelNames]);

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">설치 가능한 모델</h4>
      <div className="flex flex-col gap-1">
        {Object.entries(filterModels).map(([category, models]) => (
          <DropdownMenuSub key={category}>
            <DropdownMenuSubTrigger className="px-4 py-2">
              <span>{category}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="text-foreground">
              {models.map((model) => (
                <SubMenuItem key={model.model} model={model} />
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ))}
      </div>
    </div>
  );
};

export default DownloadableModels;
