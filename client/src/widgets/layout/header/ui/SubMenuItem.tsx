import { Button } from "@/shared/ui/button";
import { ModelInfoType } from "@/shared/types/modelType";
import { CancelModelButton } from "@/widgets/layout/header/ui";
import { useModelDownloadHandler } from "@/widgets/layout/header/hooks";
import { ArrowDownToLine, LoaderCircle } from "lucide-react";

const SubMenuItem = ({ model }: { model: ModelInfoType }) => {
  const { isPending, downloadProgress, handleDownload } = useModelDownloadHandler({ modelName: model.model });

  return (
    <div className="flex items-center justify-between px-1">
      <Button
        variant="ghost"
        aria-label="download-model"
        disabled={isPending}
        onClick={handleDownload}
        className="text-foregroun focus:text-foregroun flex h-[55px] items-center justify-between gap-3"
      >
        <div className="flex w-[200px] flex-col items-start">
          <span className="font-medium">{model.model}</span>
          <span className="text-xs text-zinc-400">
            Parameters: {model.parameterSize} | size: {model.size}
          </span>
        </div>
        {isPending && downloadProgress?.model_name === model.model ? (
          <div className="flex items-center gap-3">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            <span className="w-10 text-xs font-medium">{downloadProgress?.progress}%</span>
          </div>
        ) : (
          <ArrowDownToLine className="h-4 w-4" />
        )}
      </Button>
      {isPending && downloadProgress?.model_name === model.model && (
        <div className="pr-3">
          <CancelModelButton model_name={downloadProgress?.model_name} />
        </div>
      )}
    </div>
  );
};

export default SubMenuItem;
