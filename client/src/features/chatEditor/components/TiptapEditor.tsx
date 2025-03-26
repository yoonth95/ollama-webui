import { RefObject, useImperativeHandle } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
// import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Typography from "@tiptap/extension-typography";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { Markdown } from "tiptap-markdown";
// import { all, createLowlight } from "lowlight";
// import { CodeBlockComponent } from "@/features/chatEditor/components";
import { ShiftEnterExtension, CodeBlockEnhancementExtension } from "@/features/chatEditor/utils/tiptapExtensionUtil";
import { TiptapEditorRef } from "@/features/chatEditor/types/TiptapEditorType";
// import CodeBlockHighlightJS from "./CodeBlockHighlightJS"; // 새로 만든 확장 import

// const lowlight = createLowlight(all);

interface TiptapEditorProps {
  placeholder?: string;
  onSubmit?: (markdown: string) => void;
  editorRef?: RefObject<TiptapEditorRef | null>;
}
const TiptapEditor = ({ placeholder = "메시지를 입력하세요.", onSubmit, editorRef }: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        horizontalRule: false,
      }),
      // CodeBlockLowlight.extend({
      //   addNodeView() {
      //     return ReactNodeViewRenderer(CodeBlockComponent);
      //   },
      // }).configure({ lowlight, defaultLanguage: "auto" }),
      // CodeBlockHighlightJS,
      Highlight,
      Typography,
      Markdown,
      HorizontalRule,
      ShiftEnterExtension,
      CodeBlockEnhancementExtension,
      Placeholder.configure({
        placeholder: ({ editor }) => {
          const doc = editor.state.doc;
          // 코드 블록이 있을 경우 placeholder 없애기
          const hasCodeBlock = doc.content.content.some((node) => node.type.name === "codeBlock");
          if (hasCodeBlock) return "";
          return placeholder;
        },
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "focus:outline-none w-full px-4 py-3 max-h-84 overflow-y-auto",
      },
      handleDOMEvents: {
        keydown: (_, event) => {
          // Enter키 방지 및 마크다운 텍스트 가져오기
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            const content = editor?.storage.markdown.getMarkdown();

            onSubmit?.(content);
            return true;
          }
          return false;
        },
      },
    },
    immediatelyRender: false,
  });

  useImperativeHandle(
    editorRef,
    () => ({
      getText: () => editor?.storage.markdown.getMarkdown() || "",
      clearContent: () => editor?.commands.clearContent(),
      focus: () => editor?.commands.focus(),
    }),
    [editor],
  );

  return (
    <div className="min-h-[48px] rounded-t-2xl">
      <div className="tiptap max-h-84 w-full">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TiptapEditor;
