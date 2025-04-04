import { useModelSelectStore } from "@/shared/stores/useModelSelectStore";

const ModelText = () => {
  const selectedModel = useModelSelectStore((state) => state.selectedModel);

  return (
    <h1 className="text-foreground text-2xl font-bold sm:text-3xl">{selectedModel?.model || "무엇을 도와드릴까요?"}</h1>
  );
};

export default ModelText;
