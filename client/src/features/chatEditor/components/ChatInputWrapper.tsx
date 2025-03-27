import { RefObject, useState } from "react";
import { ChatEditor, ChatSendButton } from "@/features/chatEditor/components";
import { useMessageSubmit } from "@/features/chatEditor/hooks/useMessageSubmit";
import { TiptapEditorRef } from "@/features/chatEditor/types/TiptapEditorType";

interface ChatInputWrapperPropsType {
  editorRef: RefObject<TiptapEditorRef | null>;
  chatRoomId: string;
}
const ChatInputWrapper = ({ editorRef, chatRoomId }: ChatInputWrapperPropsType) => {
  const [hasValidContent, setHasValidContent] = useState(false);
  const { handleSubmit, isPending } = useMessageSubmit(editorRef, chatRoomId);

  return (
    <div
      ref={(node) => node?.addEventListener("click", () => editorRef?.current?.focus())}
      className="flex w-full cursor-text flex-col rounded-2xl border border-border dark:border-accent bg-background shadow-sm dark:bg-accent"
    >
      <ChatEditor editorRef={editorRef} onValidChange={setHasValidContent} handleSubmit={handleSubmit} />
      <ChatSendButton hasValidContent={hasValidContent} isPending={isPending} onSubmit={handleSubmit} />
    </div>
  );
};

export default ChatInputWrapper;
