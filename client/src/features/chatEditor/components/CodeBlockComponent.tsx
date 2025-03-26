import { NodeViewContent, NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { useEffect, useRef } from "react";
import highlight from "highlight.js";

interface CodeBlockProps extends NodeViewProps {
  updateAttributes: (attributes: Partial<{ language: "auto" | string }>) => void;
}

const CodeBlockComponent = ({ node }: CodeBlockProps) => {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      // highlight.js로 구문 강조 적용
      highlight.highlightElement(codeRef.current);
    }
  }, [node.textContent]); // 텍스트가 변경될 때마다 강조 적용

  return (
    <NodeViewWrapper className="code-block">
      <pre>
        <code ref={codeRef} data-language={node.attrs.language}>
          <NodeViewContent as="span" />
        </code>
      </pre>
    </NodeViewWrapper>
  );
};

export default CodeBlockComponent;
