import { ModelText } from "@/features/home/components";
import EditorContainer from "@/features/chatEditor/EditorContainer";

export default function HomePage() {
  return (
    <div className="mt-[-6rem] flex h-full w-full flex-col items-center justify-center">
      <section className="mb-6">
        <ModelText />
      </section>
      <EditorContainer />
    </div>
  );
}
