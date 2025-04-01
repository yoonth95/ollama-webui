import { useCallback, useRef, useState } from "react";
import {
  ChatOptionButtonContainer,
  ChatSendButton,
  ImageContainer,
  TiptapEditor,
} from "@/features/chatEditor/components";
import { useMessageSubmit } from "@/features/chatEditor/hooks/useMessageSubmit";
import { TiptapEditorRef } from "@/features/chatEditor/types/TiptapEditorType";

const ChatEditorWrapper = () => {
  const editorRef = useRef<TiptapEditorRef | null>(null);
  const [hasValidContent, setHasValidContent] = useState(false);
  const { handleSubmit, isPending } = useMessageSubmit(editorRef);

  const handleContentChange = useCallback((content: string) => {
    const isValid = content.replace(/[\s\n]/g, "").length > 0;
    setHasValidContent(isValid);
  }, []);

  const handleEditorClick = useCallback(
    (node: HTMLElement | null) => {
      node?.addEventListener("click", () => editorRef?.current?.focus());
    },
    [editorRef],
  );

  return (
    <div
      ref={handleEditorClick}
      className="border-border dark:border-accent bg-background dark:bg-accent flex w-full cursor-text flex-col rounded-2xl border shadow-sm"
    >
      <ImageContainer />
      <TiptapEditor
        editorRef={editorRef}
        placeholder="무엇이든 물어보세요"
        onChange={handleContentChange}
        onSubmit={handleSubmit}
      />
      <div className="flex w-full items-center justify-between px-3 py-3">
        <ChatOptionButtonContainer />
        <ChatSendButton hasValidContent={hasValidContent} isPending={isPending} onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default ChatEditorWrapper;
