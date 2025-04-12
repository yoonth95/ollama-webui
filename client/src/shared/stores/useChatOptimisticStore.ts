import { create } from "zustand";
import { ImageDataType } from "@/shared/types/chatMessageType";

export type ErrorType = "network" | "timeout" | "model" | "content" | "unknown";

interface ChatOptimisticStoreType {
  isOptimistic: boolean;
  isLoading: boolean;
  userChatData: {
    content: string;
    images: ImageDataType[];
  };

  activateOptimisticUI: () => void;
  deactivateOptimisticUI: () => void;
  setLoading: (isLoading: boolean) => void;
  setUserChatData: (userChatData: { content: string; images: ImageDataType[] }) => void;
  clearUserChatData: () => void;
}

export const useChatOptimisticStore = create<ChatOptimisticStoreType>((set) => ({
  isOptimistic: false,
  isLoading: false,
  userChatData: { content: "", images: [] },

  activateOptimisticUI: () =>
    set({
      isOptimistic: true,
      isLoading: true,
    }),

  deactivateOptimisticUI: () =>
    set({
      isOptimistic: false,
      isLoading: false,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setUserChatData: (userChatData) => set({ userChatData }),
  clearUserChatData: () => set({ userChatData: { content: "", images: [] } }),
}));
