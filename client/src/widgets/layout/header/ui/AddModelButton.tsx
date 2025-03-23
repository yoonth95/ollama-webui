import { Button } from "@/shared/ui/button";
import { CancelModelButton } from "@/widgets/layout/header/ui";
import { useModelDownloadHandler } from "@/widgets/layout/header/hooks";
import { LoaderCircle } from "lucide-react";

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
        <Button
          variant="ghost"
          aria-label="model-download"
          onClick={handleDownload}
          disabled={isPending}
          className="w-full justify-start px-3 py-2 text-foreground dark:hover:bg-neutral-700/50"
        >
          Ollama.com에서 &quot;{inputValue}&quot; 모델 다운로드
        </Button>
      ) : (
        <div className="flex gap-3">
          <div className="flex flex-col">
            <div className="flex items-center">
              <span className="w-7">
                <LoaderCircle className="h-4 w-4 animate-spin" />
              </span>
              <span className="w-[350px] text-sm font-medium">
                Downloading &quot;{downloadProgress?.model_name}&quot; ({downloadProgress?.progress}%)
              </span>
              <CancelModelButton model_name={downloadProgress?.model_name} />
            </div>
            <p className="ml-7 w-[350px] truncate pr-3 text-xs text-secondary-foreground">{downloadProgress?.digest}</p>
          </div>
        </div>
      )}
    </div>
  );
}
