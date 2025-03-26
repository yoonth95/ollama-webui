import { ModelText } from "@/features/home/components";
import { ChatInputContainer } from "@/features/chatEditor/components";

export default function HomePage() {
  return (
    <div className="absolute top-[-1rem] flex h-full w-full flex-col items-center justify-center z-0">
      <section className="mb-6">
        <ModelText />
      </section>
      <ChatInputContainer />
    </div>
  );
}
