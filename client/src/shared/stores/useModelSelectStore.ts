import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ModelInfoType } from "@/shared/types/modelType";

type ModelStoreType = {
  selectedModel: ModelInfoType | null;
  setSelectedModel: (model: ModelInfoType | null) => void;
};

export const useModelSelectStore = create<ModelStoreType>()(
  persist(
    (set) => ({
      selectedModel: null,
      setSelectedModel: (model) => set({ selectedModel: model }),
    }),
    {
      name: "model-storage",
      partialize: (state) => ({ selectedModel: state.selectedModel }),
    },
  ),
);
