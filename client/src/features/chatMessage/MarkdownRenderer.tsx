/* eslint-disable @typescript-eslint/no-unused-vars */
import ReactMarkdown from "react-markdown";
import { ClientSyntaxHighlighter, CodeBlockToolBar } from "@/features/chatMessage/components";

interface MarkdownRendererPropsType {
  content: string;
  type: "User" | "Bot";
}
const MarkdownRenderer = ({ content, type }: MarkdownRendererPropsType) => {
  const chatType = type === "User" ? "user-message" : "bot-message";

  return (
    <div className={chatType}>
      <ReactMarkdown
        components={{
          pre({ node, children, ...props }) {
            let codeContent = "";
            let language = "";

            const childrenArray = Array.isArray(children) ? children : [children];
            childrenArray.forEach((child) => {
              if (child?.props?.className) {
                const match = /language-(\w+)/.exec(child.props.className);
                if (match) {
                  language = match[1];
                }
              }
              if (child?.props?.children) {
                codeContent = String(child.props.children).replace(/\n$/, "");
              }
            });

            return (
              <div className="code-block-wrapper">
                <CodeBlockToolBar language={language} codeContent={codeContent} />
                <pre {...props}>{children}</pre>
              </div>
            );
          },
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !className;
            const codeContent = String(children).replace(/\n$/, "");
            const codeClassName = match ? "" : "code-no-language";

            return !isInline && match ? (
              <ClientSyntaxHighlighter language={match[1]} codeContent={codeContent} />
            ) : (
              <code className={codeClassName} {...props}>
                {children}
              </code>
            );
          },
          p({ node, children }) {
            return <p>{children}</p>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
