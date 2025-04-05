import { useEffect, useRef } from "react";
import Markdown from "markdown-to-jsx";
import Prism from "prismjs";
import "prismjs/themes/prism-vsc-dark-plus.css";
import "prismjs/plugins/autoloader/prism-autoloader.min.js";

import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";

if (typeof window !== "undefined" && window.Prism) {
  window.Prism.plugins.autoloader.languages_path = "https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/";
}

// 코드 블록 렌더링 컴포넌트
const CodeBlock = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  const codeRef = useRef<HTMLElement>(null);
  const language = className?.replace("lang-", "") || "";

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [language, children]);

  return (
    <div className="w-full overflow-hidden rounded-lg">
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

// 인라인 코드 렌더링 컴포넌트
const InlineCode = ({ children }: { children: React.ReactNode }) => {
  return <code className="inline-code break-words whitespace-normal">{children}</code>;
};

const MarkdownViewer = ({ content }: { content: string }) => {
  useEffect(() => {
    Prism.highlightAll();
  }, [content]);

  return (
    <div
      className="markdown-container"
      style={{ maxWidth: "100%", overflowWrap: "break-word", wordBreak: "break-word" }}
    >
      <Markdown
        options={{
          overrides: {
            // 코드 블록 처리 (```로 감싸진 경우)
            pre: {
              component: ({ children }) => {
                const codeElement = children.props.children; // <pre> 안의 <code> 요소
                const className = children.props.className || "";
                return <CodeBlock className={className}>{codeElement}</CodeBlock>;
              },
            },
            // 인라인 코드 처리 (`로 감싸진 경우)
            code: {
              component: ({ className, children }) => {
                // className이 있으면 코드 블록으로 처리되므로 여기서는 인라인 코드만 남음
                if (className) {
                  return <code className={className}>{children}</code>; // pre에서 처리하므로 무시됨
                }
                return <InlineCode>{children}</InlineCode>;
              },
            },
            a: {
              props: {
                target: "_blank",
                rel: "noopener noreferrer",
              },
            },
            table: {
              props: {
                style: { width: "100%", tableLayout: "fixed", wordBreak: "break-word" },
              },
            },
            img: {
              props: {
                style: { maxWidth: "100%", height: "auto" },
              },
            },
          },
        }}
      >
        {content}
      </Markdown>
    </div>
  );
};

export default MarkdownViewer;
