import { useRef } from "react";
import { ChatEditorWrapper } from "@/features/chatEditor/components";
import { TiptapEditorRef } from "@/features/chatEditor/types/TiptapEditorType";
import "@/features/chatEditor/styles/editor.css";

const EditorContainer = () => {
  const editorRef = useRef<TiptapEditorRef | null>(null);

  return (
    <section className="mx-auto mb-8 flex w-full gap-4 text-base md:max-w-[40rem] md:gap-5 lg:gap-6 xl:max-w-[48rem]">
      <ChatEditorWrapper editorRef={editorRef} />
    </section>
  );
};

export default EditorContainer;
