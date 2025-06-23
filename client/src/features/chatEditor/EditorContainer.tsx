import { ChatEditorWrapper } from "@/features/chatEditor/components";

interface EditorContainerPropsType {
  isChatRoomDetailLoading: boolean;
}
const EditorContainer = ({ isChatRoomDetailLoading }: EditorContainerPropsType) => {
  return (
    <section className="mx-auto mb-4 flex w-full gap-4 text-base md:max-w-[46rem] md:gap-5 lg:gap-6 xl:max-w-[50rem]">
      <ChatEditorWrapper isChatRoomDetailLoading={isChatRoomDetailLoading} />
    </section>
  );
};

export default EditorContainer;
