import { ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Typography from "@tiptap/extension-typography";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { Markdown } from "tiptap-markdown";
import { common, createLowlight } from "lowlight";
import { CodeBlockComponent } from "@/features/chatEditor/components";
import {
  ShiftEnterExtension,
  CodeBlockEnhancementExtension,
  HorizontalRuleEnhancementExtension,
} from "@/features/chatEditor/utils/tiptapExtensionUtil";

const lowlight = createLowlight(common);

export const createEditorExtensions = (placeholder: string) => [
  StarterKit.configure({
    codeBlock: false,
    horizontalRule: false,
  }),
  CodeBlockLowlight.extend({
    addNodeView() {
      return ReactNodeViewRenderer(CodeBlockComponent);
    },
  }).configure({ lowlight, defaultLanguage: null }),
  Highlight,
  Typography,
  Markdown,
  HorizontalRule,
  HorizontalRuleEnhancementExtension,
  ShiftEnterExtension,
  CodeBlockEnhancementExtension,
  Placeholder.configure({
    placeholder: ({ editor }) => {
      const doc = editor.state.doc;
      const hasCodeBlock = doc.content.content.some((node) => node.type.name === "codeBlock");
      if (hasCodeBlock) return "";
      return placeholder;
    },
  }),
];
