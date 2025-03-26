import { useEffect, useRef, useState } from "react";
import { CircleCheck, Copy } from "lucide-react";

interface CodeBlockToolBarPropsType {
  language: string;
  codeContent: string;
}
const CodeBlockToolBar = ({ language, codeContent }: CodeBlockToolBarPropsType) => {
  const [isCopy, setIsCopy] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const copyToClipboard = () => {
    if (navigator.clipboard && codeContent) {
      navigator.clipboard.writeText(codeContent);
      setIsCopy(true);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        setIsCopy(false);
        timeoutRef.current = null;
      }, 1500);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className="flex h-9 select-none items-center justify-between rounded-t-[5px] bg-secondary px-4 py-2 font-sans text-xs text-secondary-foreground dark:bg-secondary">
        {language}
      </div>
      <div className="sticky top-10">
        <div className="absolute bottom-0 right-0 flex h-9 items-center">
          <div className="flex items-center rounded bg-secondary px-2 font-sans text-xs text-secondary-foreground dark:bg-secondary">
            {isCopy ? (
              <div className="flex items-center gap-1 px-4 py-1">
                <CircleCheck className="h-3 w-3" />
                복사됨
              </div>
            ) : (
              <button
                className="flex select-none items-center gap-1 px-4 py-1"
                aria-label="복사"
                onClick={copyToClipboard}
              >
                <Copy className="h-3 w-3" />
                복사
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CodeBlockToolBar;
