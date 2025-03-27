import { RefObject } from "react";
import { TiptapEditor } from "@/features/chatEditor/components";
import { TiptapEditorRef } from "@/features/chatEditor/types/TiptapEditorType";

interface ChatEditorPropsType {
  editorRef: RefObject<TiptapEditorRef | null>;
  onValidChange: (isValid: boolean) => void;
  handleSubmit: () => void;
}
const ChatEditor = ({ editorRef, onValidChange, handleSubmit }: ChatEditorPropsType) => (
  <TiptapEditor
    editorRef={editorRef}
    placeholder="무엇이든 물어보세요"
    onChange={(content) => {
      const isValid = content.replace(/[\s\n]/g, "").length > 0;
      onValidChange(isValid);
    }}
    onSubmit={handleSubmit}
  />
);

export default ChatEditor;
