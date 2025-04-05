import { ModelText } from "@/features/home/components";
import EditorContainer from "@/features/chatEditor/EditorContainer";

export default function HomePage() {
  return (
    <div className="absolute top-[-1rem] z-0 flex h-full w-full flex-col items-center justify-center">
      <section className="mb-6">
        <ModelText />
      </section>
      <EditorContainer />
    </div>
  );
}
