import { ModelText } from "@/features/home/components";
import EditorContainer from "@/features/chatEditor/EditorContainer";

export default function HomePage() {
  return (
    <div className="absolute top-[-1rem] flex h-full w-full flex-col items-center justify-center z-0">
      <section className="mb-6">
        <ModelText />
      </section>
      <EditorContainer />
    </div>
  );
}
