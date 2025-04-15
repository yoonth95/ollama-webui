import { create } from "zustand";
import { ImageDataType } from "@/shared/types/chatMessageType";

export type ErrorType = "network" | "timeout" | "model" | "content" | "unknown";

interface ChatOptimisticStoreType {
  isOptimistic: boolean;
  isCreateRoomLoading: boolean;
  userChatData: {
    content: string;
    images: ImageDataType[];
  };
  isReceivingResponse: boolean;

  activateOptimisticUI: () => void;
  deactivateOptimisticUI: () => void;
  setIsReceivingResponse: (isReceivingResponse: boolean) => void;
  setCreateRoomLoading: (isCreateRoomLoading: boolean) => void;
  setUserChatData: (userChatData: { content: string; images: ImageDataType[] }) => void;
  clearUserChatData: () => void;
}

export const useChatOptimisticStore = create<ChatOptimisticStoreType>((set) => ({
  isOptimistic: false,
  isCreateRoomLoading: false,
  userChatData: { content: "", images: [] },
  isReceivingResponse: false,

  activateOptimisticUI: () =>
    set({
      isOptimistic: true,
      isCreateRoomLoading: true,
    }),

  deactivateOptimisticUI: () =>
    set({
      isOptimistic: false,
      isCreateRoomLoading: false,
      isReceivingResponse: false,
    }),

  setIsReceivingResponse: (isReceivingResponse: boolean) => set({ isReceivingResponse }),
  setCreateRoomLoading: (isCreateRoomLoading) => set({ isCreateRoomLoading }),
  setUserChatData: (userChatData) => set({ userChatData }),
  clearUserChatData: () => set({ userChatData: { content: "", images: [] } }),
}));
