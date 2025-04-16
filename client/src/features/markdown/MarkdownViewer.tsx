import { useEffect } from "react";
import Markdown from "markdown-to-jsx";
import Prism from "prismjs";
import { CodeBlock, InlineCode } from "@/features/markdown/components";
import "prismjs/plugins/autoloader/prism-autoloader.min.js";
import "@/features/markdown/styles/prism-vsc-dark-plus.min.css";

// Prism 플러그인 설정 (코드 블록 언어 자동 로드)
if (typeof window !== "undefined" && window.Prism) {
  window.Prism.plugins.autoloader.languages_path = "https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/";
}

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
            // 코드 블록 (```)
            pre: {
              component: ({ children }) => {
                const codeElement = children.props.children;
                const className = children.props.className || "";
                return <CodeBlock className={className}>{codeElement}</CodeBlock>;
              },
            },
            // 인라인 코드 (`)
            code: {
              component: ({ className, children }) => {
                if (className) {
                  return <code className={className}>{children}</code>;
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
          },
        }}
      >
        {content}
      </Markdown>
    </div>
  );
};

export default MarkdownViewer;
