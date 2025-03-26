import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import CodeBlockComponent from "./CodeBlockComponent";
import "highlight.js/styles/default.css"; // highlight.js 스타일 import (원하는 스타일로 변경 가능)

const CodeBlockHighlightJS = Node.create({
  name: "codeBlock",
  group: "block",
  content: "text*",
  marks: "",
  code: true,
  defining: true,
  addOptions() {
    return {
      defaultLanguage: "auto",
    };
  },

  addAttributes() {
    return {
      language: {
        default: this.options.defaultLanguage,
        parseHTML: (element) => element.getAttribute("data-language") || this.options.defaultLanguage,
        renderHTML: (attributes) => {
          return {
            "data-language": attributes.language,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "pre",
        preserveWhitespace: "full",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["pre", mergeAttributes(HTMLAttributes, { "data-language": this.options.defaultLanguage }), ["code", 0]];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComponent);
  },
});

export default CodeBlockHighlightJS;
