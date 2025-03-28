import { RefObject, useState } from "react";
import { ChatSendButton, TiptapEditor } from "@/features/chatEditor/components";
import { useMessageSubmit } from "@/features/chatEditor/hooks/useMessageSubmit";
import { TiptapEditorRef } from "@/features/chatEditor/types/TiptapEditorType";

interface ChatEditorWrapperPropsType {
  editorRef: RefObject<TiptapEditorRef | null>;
}
const ChatEditorWrapper = ({ editorRef }: ChatEditorWrapperPropsType) => {
  const [hasValidContent, setHasValidContent] = useState(false);
  const { handleSubmit, isPending } = useMessageSubmit(editorRef);

  return (
    <div
      ref={(node) => node?.addEventListener("click", () => editorRef?.current?.focus())}
      className="flex w-full cursor-text flex-col rounded-2xl border border-border dark:border-accent bg-background shadow-sm dark:bg-accent"
    >
      <TiptapEditor
        editorRef={editorRef}
        placeholder="무엇이든 물어보세요"
        onChange={(content) => {
          const isValid = content.replace(/[\s\n]/g, "").length > 0;
          setHasValidContent(isValid);
        }}
        onSubmit={handleSubmit}
      />
      <ChatSendButton hasValidContent={hasValidContent} isPending={isPending} onSubmit={handleSubmit} />
    </div>
  );
};

export default ChatEditorWrapper;
