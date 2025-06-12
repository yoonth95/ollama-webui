import { CancelModelButton } from "@/widgets/layout/header/components";
import { useModelDownloadHandler } from "@/widgets/layout/header/hooks";
import { Button } from "@/shared/ui/button";
import Loader from "@/shared/ui/loader";

interface AddModelButtonProps {
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
}

export default function AddModelButton({ inputValue, setInputValue }: AddModelButtonProps) {
  const { isPending, downloadProgress, handleDownload } = useModelDownloadHandler({
    modelName: inputValue,
    onSuccess: () => setInputValue(""),
  });

  return (
    <div>
      {!isPending ? (
        <div className="scrollbar-hidden relative flex-1 overflow-x-auto whitespace-nowrap">
          <Button
            variant="ghost"
            aria-label="model-download"
            onClick={handleDownload}
            disabled={isPending}
            className="text-foreground w-full justify-start gap-0 px-3 py-2 dark:hover:bg-neutral-700/50"
          >
            <span>Ollama.com에서 &quot;</span>
            <span className="truncate">{inputValue}</span>
            <span>&quot; 모델 다운로드</span>
          </Button>
        </div>
      ) : (
        <div className="flex gap-3">
          <div className="flex flex-col">
            <div className="flex items-center">
              <span className="w-7">
                <Loader size="sm" />
              </span>
              <span className="w-[350px] text-sm font-medium">
                Downloading &quot;{downloadProgress?.model_name}&quot; ({downloadProgress?.progress}%)
              </span>
              <CancelModelButton model_name={downloadProgress?.model_name} />
            </div>
            <p className="text-secondary-foreground ml-7 w-[350px] truncate pr-3 text-xs">{downloadProgress?.digest}</p>
          </div>
        </div>
      )}
    </div>
  );
}
