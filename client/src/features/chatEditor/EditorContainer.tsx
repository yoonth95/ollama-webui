import { ChatEditorWrapper } from "@/features/chatEditor/components";
import "@/features/chatEditor/styles/editor.css";

const EditorContainer = () => {
  return (
    <section className="mx-auto mb-4 flex w-full gap-4 text-base md:max-w-[44rem] md:gap-5 lg:gap-6 xl:max-w-[48rem]">
      <ChatEditorWrapper />
    </section>
  );
};

export default EditorContainer;
