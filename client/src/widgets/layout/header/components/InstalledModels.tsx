import { useQueryClient } from "@tanstack/react-query";
import { DropdownMenuItem } from "@/shared/ui/dropdown-menu";
import { CustomScrollbar } from "@/shared/ui/custom-scrollbar";
import { DeleteModelButton } from "@/widgets/layout/header/components";
import { useModelSelectStore } from "@/shared/stores/useModelSelectStore";
import { GetModelResponseType } from "@/shared/types/modelType";
import { queryKeys } from "@/shared/api";
import { Check } from "lucide-react";

const InstalledModels = () => {
  const { selectedModel, setSelectedModel } = useModelSelectStore();
  const queryClient = useQueryClient();

  const response = queryClient.getQueryData<GetModelResponseType>(queryKeys.models.list());
  const models = response?.data || [];

  const handleModelChange = (modelName: string) => {
    setSelectedModel(models.find((m) => m.model === modelName) || null);
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">설치된 모델</h4>
      <CustomScrollbar className="max-h-[12.5rem] overflow-y-auto">
        <div className="space-y-1">
          {models.length > 0 ? (
            <>
              {models.map((model) => (
                <DropdownMenuItem
                  key={model.model}
                  onSelect={() => handleModelChange(model.model)}
                  className="w-full cursor-pointer justify-between gap-3 px-2 py-2 font-normal text-foreground"
                >
                  <DeleteModelButton model={model.model} />
                  <span className="flex-grow text-left">{model.model}</span>
                  {selectedModel?.model === model.model && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              ))}
            </>
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">모델 없음</div>
          )}
        </div>
      </CustomScrollbar>
    </div>
  );
};

export default InstalledModels;
