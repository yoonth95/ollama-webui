import { useCallback, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  ChatOptionButtonContainer,
  ChatSendButton,
  ImageContainer,
  TiptapEditor,
} from "@/features/chatEditor/components";
import { useMessageSubmit } from "@/features/chatEditor/hooks/useMessageSubmit";
import { TiptapEditorRef } from "@/features/chatEditor/types/TiptapEditorType";

interface ChatEditorWrapperPropsType {
  isChatRoomDetailLoading: boolean;
}
const ChatEditorWrapper = ({ isChatRoomDetailLoading }: ChatEditorWrapperPropsType) => {
  const editorRef = useRef<TiptapEditorRef | null>(null);
  const { chatRoomId = "" } = useParams<{ chatRoomId?: string }>();
  const [hasValidContent, setHasValidContent] = useState(false);
  const { handleSubmit, isPending } = useMessageSubmit({ editorRef, chatRoomId });

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
      className="border-border dark:border-accent bg-background dark:bg-accent mx-4 flex w-full cursor-text flex-col rounded-2xl border shadow-sm"
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
        <ChatSendButton
          chatRoomId={chatRoomId}
          hasValidContent={hasValidContent}
          isPending={isPending || isChatRoomDetailLoading}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default ChatEditorWrapper;
