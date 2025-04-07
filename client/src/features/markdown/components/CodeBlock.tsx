import React, { useEffect, useRef } from "react";
import Prism from "prismjs";
import CodeBlockToolBar from "@/features/markdown/components/CodeblockToolBar";
interface CodeBlockPropsType {
  className?: string;
  children: React.ReactNode;
}

const CodeBlock = ({ className, children }: CodeBlockPropsType) => {
  const codeRef = useRef<HTMLElement>(null);
  const language = className?.replace("lang-", "") || "";
  const codeContent = String(children).replace(/\n$/, "");

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [language, children]);

  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      <CodeBlockToolBar language={language} codeContent={codeContent} />
      <pre className="w-full overflow-x-auto">
        <code
          ref={codeRef}
          className={
            language ? `language-${language} block w-full whitespace-pre` : "no-language block w-full whitespace-pre"
          }
        >
          {children}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;
