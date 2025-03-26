import React, { startTransition, useActionState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "@/shared/ui/button";
import { TiptapEditor } from "@/features/chatEditor/components";
import { useModelSelectStore } from "@/shared/stores/useModelSelectStore";
// import { sendMessageAction } from "@/app/(layout)/(home)/actions/sendMessageAction";
// import { useChat } from "@/providers/ChatProvider";
import { TiptapEditorRef } from "@/features/chatEditor/types/TiptapEditorType";
import "@/features/chatEditor/styles/editor.css";
import { LoaderCircle, Send } from "lucide-react";

const ChatInputContainer = ({ chatRoomId = "" }: { chatRoomId?: string }) => {
  const navigate = useNavigate();
  const editorRef = useRef<TiptapEditorRef>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const selectedModel = useModelSelectStore((state) => state.selectedModel);
  // const { setPendingMessage } = useChat();

  // const [actionState, formAction, isPending] = useActionState(sendMessageAction, null);

  // 메시지 전송
  // const handleSubmit = (e?: React.FormEvent<HTMLFormElement>, markdown?: string) => {
  //   if (e) e.preventDefault();

  //   if (!isPending) {
  //     const content = e ? editorRef.current?.getText() : markdown;
  //     const model = selectedModel?.model;

  //     if (content?.trim() && model) {
  //       const formData = e ? new FormData(e.currentTarget) : new FormData();
  //       formData.set("message", content);
  //       formData.set("model", model);
  //       formData.set("roomId", chatRoomId || "");

  //       setPendingMessage(content);

  //       // 즉시 로딩 페이지로 이동
  //       navigate(`/chat/loading?internal=true`);

  //       startTransition(() => {
  //         formAction(formData);
  //       });

  //       editorRef.current?.clearContent();
  //     }
  //   }
  // };

  // form 클릭 시 에디터에 포커스
  const handleContainerClick = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // useEffect(() => {
  //   if (actionState) {
  //     const { ok, data, message } = actionState;
  //     if (!ok) {
  //       toast.error(message || "메시지 전송에 실패했습니다");
  //       navigate(`/`);
  //     }
  //     if (ok && data) {
  //       console.log(ok, data.id);
  //       navigate(`/chat/${data.id}`);
  //     }
  //   }
  // }, [actionState, navigate, chatRoomId]);

  return (
    <section className="mx-auto mb-8 flex w-full gap-4 text-base md:max-w-[40rem] md:gap-5 lg:gap-6 xl:max-w-[48rem]">
      <form
        ref={formRef}
        // onSubmit={(e) => handleSubmit(e)}
        onClick={handleContainerClick}
        className="flex w-full cursor-text flex-col rounded-2xl border border-border dark:border-accent bg-background shadow-sm dark:bg-accent"
      >
        <input type="hidden" name="message" />
        <input type="hidden" name="model" />
        <TiptapEditor
          editorRef={editorRef}
          placeholder="무엇이든 물어보세요."
          // onSubmit={(markdown: string) => handleSubmit(undefined, markdown)}
        />
        <div className="flex w-full items-center justify-end px-3 py-3">
          {/* {isPending ? (
            <span className="pointer-events-none flex h-8 w-8 items-center justify-center rounded-full bg-primary opacity-50 dark:bg-foreground dark:text-primary">
              <LoaderCircle className="h-5 w-5 animate-spin" />
            </span>
          ) : (
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-primary hover:bg-primary/70 hover:text-white dark:bg-foreground dark:text-primary hover:dark:bg-foreground hover:dark:text-primary"
              aria-label="메시지 보내기"
              disabled={isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          )} */}
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-foreground text-background"
            aria-label="메시지 보내기"
            // disabled={isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </section>
  );
};

export default ChatInputContainer;
