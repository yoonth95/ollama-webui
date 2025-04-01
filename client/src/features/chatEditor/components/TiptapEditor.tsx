import { memo, RefObject, useCallback, useImperativeHandle } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { TiptapEditorRef } from "@/features/chatEditor/types/TiptapEditorType";
import { usePasteImageHandler } from "@/features/chatEditor/hooks/usePasteImageHandler";
import { createEditorExtensions } from "@/features/chatEditor/configs/editorExtensions";

interface TiptapEditorPropsType {
  editorRef?: RefObject<TiptapEditorRef | null>;
  placeholder?: string;
  onChange?: (content: string) => void;
  onSubmit: () => void;
}

const TiptapEditor = memo(
  ({ placeholder = "메시지를 입력하세요.", onChange, editorRef, onSubmit }: TiptapEditorPropsType) => {
    const handlePasteImage = usePasteImageHandler();

    const editor = useEditor({
      extensions: createEditorExtensions(placeholder),
      content: "",
      onUpdate: ({ editor }) => {
        onChange?.(editor.storage.markdown.getMarkdown());
      },
      editorProps: {
        attributes: {
          class: "focus:outline-none w-full px-4 py-3 max-h-84 overflow-y-auto",
        },
        handlePaste: (_, event) => handlePasteImage(event),
        handleDOMEvents: {
          keydown: (view, event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              const content = view.state.doc.textContent;
              if (content.trim() !== "") onSubmit();
              return true;
            }
            return false;
          },
        },
      },
      immediatelyRender: false,
    });

    const memoizedImperativeHandle = useCallback(
      () => ({
        getText: () => editor?.storage.markdown.getMarkdown() || "",
        clearContent: () => editor?.commands.clearContent(),
        focus: () => editor?.commands.focus(),
      }),
      [editor],
    );

    useImperativeHandle(editorRef, memoizedImperativeHandle, [memoizedImperativeHandle]);

    return (
      <div className="min-h-[48px] rounded-t-2xl">
        <div className="tiptap max-h-84 w-full">
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  },
);

export default TiptapEditor;
