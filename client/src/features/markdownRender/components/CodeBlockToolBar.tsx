import { useState } from "react";
import { CircleCheck, Copy } from "lucide-react";

interface CodeBlockToolBarPropsType {
  language: string;
  codeContent: string;
}
const CodeBlockToolBar = ({ language, codeContent }: CodeBlockToolBarPropsType) => {
  const [isCopy, setIsCopy] = useState(false);

  const copyToClipboard = () => {
    if (navigator.clipboard && codeContent) {
      navigator.clipboard.writeText(codeContent);
      setIsCopy(true);

      setTimeout(() => setIsCopy(false), 1500);
    }
  };

  return (
    <>
      <div className="code-block-toolbar flex h-9 items-center justify-between rounded-t-[5px] px-5 py-2 font-sans text-xs select-none">
        {language}
      </div>
      <div className="sticky top-10">
        <div className="absolute right-0 bottom-[5px] flex items-center">
          <div className="code-block-toolbar flex items-center justify-center rounded px-2 font-sans text-xs">
            {isCopy ? (
              <div className="flex h-7 w-20 items-center gap-1 px-3 py-1">
                <CircleCheck className="h-3 w-3" />
                복사됨
              </div>
            ) : (
              <button
                className="flex h-7 w-20 cursor-pointer items-center justify-center gap-1 px-3 py-1 font-sans text-xs select-none"
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
  );
};

export default CodeBlockToolBar;
