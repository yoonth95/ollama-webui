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
    // <div className="code-block-toolbar">
    <>
      <div className="code-block-toolbar flex h-9 items-center justify-between rounded-t-[5px] px-5 py-2 font-sans text-xs select-none">
        {language}
      </div>
      <div className="sticky top-10">
        <div className="absolute right-0 bottom-[5px] flex items-center">
          <div className="code-block-toolbar flex items-center rounded px-2 font-sans text-xs">
            {isCopy ? (
              <div className="flex items-center gap-1 px-4 py-1">
                <CircleCheck className="h-3 w-3" />
                복사됨
              </div>
            ) : (
              <button
                className="flex h-7 cursor-pointer items-center gap-1 px-4 py-1 font-sans text-xs select-none"
                aria-label="copy"
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
    // </div>
  );
};

export default CodeBlockToolBar;
