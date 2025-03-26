import { useModelSelectStore } from "@/shared/stores/useModelSelectStore";

const ModelText = () => {
  const selectedModel = useModelSelectStore((state) => state.selectedModel);

  return <h1 className="text-3xl font-bold text-foreground">{selectedModel?.model || "무엇을 도와드릴까요?"}</h1>;
};

export default ModelText;
