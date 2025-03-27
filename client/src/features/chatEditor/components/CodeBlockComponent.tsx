import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";

const CodeBlockComponent = () => {
  return (
    <NodeViewWrapper className="code-block">
      <pre>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
};

export default CodeBlockComponent;
