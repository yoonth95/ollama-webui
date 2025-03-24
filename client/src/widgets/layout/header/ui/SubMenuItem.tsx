import { Button } from "@/shared/ui/button";
import { ModelInfoType } from "@/shared/types/modelType";
import { CancelModelButton } from "@/widgets/layout/header/ui";
import { useModelDownloadHandler } from "@/widgets/layout/header/hooks";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { cn } from "@/shared/lib/utils";
import { ArrowDownToLine, LoaderCircle } from "lucide-react";

const SubMenuItem = ({ model }: { model: ModelInfoType }) => {
  const isMobile = useIsMobile();
  const { isPending, downloadProgress, handleDownload } = useModelDownloadHandler({ modelName: model.model });

  return (
    <div className={cn("flex pl-1 items-center w-full", isPending ? "pr-2" : "pr-3")}>
      <Button
        variant="ghost"
        aria-label="download-model"
        disabled={isPending}
        onClick={handleDownload}
        className={cn(
          "text-foreground focus:text-foreground flex h-16 items-center justify-between w-full",
          isPending && "w-[calc(100%-2rem)]",
        )}
      >
        <div className="flex flex-col items-start">
          <span className="font-medium">{model.model}</span>
          <span className="text-xs text-muted-foreground">
            Parameters: {model.parameterSize} | size: {model.size}
          </span>
        </div>
        {isPending && downloadProgress?.model_name === model.model ? (
          <div className={cn("flex items-center", isMobile ? "flex-col gap-1" : "gap-3")}>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            <span className="w-10 text-xs font-medium">{downloadProgress?.progress}%</span>
          </div>
        ) : (
          <ArrowDownToLine className="h-4 w-4" />
        )}
      </Button>
      {isPending && downloadProgress?.model_name === model.model && (
        <CancelModelButton model_name={downloadProgress?.model_name} />
      )}
    </div>
  );
};

export default SubMenuItem;
