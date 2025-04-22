import { create } from "zustand";
import { ImageDataType } from "@/shared/types/chatMessageType";

export type userChatDataType = {
  content: string;
  images: ImageDataType[];
};

interface ChatOptimisticStoreType {
  isOptimistic: boolean;
  isCreateRoomLoading: boolean;
  isReceivingResponse: boolean;
  userChatData: userChatDataType;

  activateOptimisticUI: () => void;
  deactivateOptimisticUI: () => void;
  setIsReceivingResponse: (isReceivingResponse: boolean) => void;
  setIsCreateRoomLoading: (isCreateRoomLoading: boolean) => void;
  setUserChatData: (userChatData: userChatDataType) => void;
  clearUserChatData: () => void;
}

export const useChatOptimisticStore = create<ChatOptimisticStoreType>((set) => ({
  isOptimistic: false,
  isCreateRoomLoading: false,
  isReceivingResponse: false,
  userChatData: { content: "", images: [] },

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
  setIsCreateRoomLoading: (isCreateRoomLoading) => set({ isCreateRoomLoading }),
  setUserChatData: (userChatData) => set({ userChatData }),
  clearUserChatData: () => set({ userChatData: { content: "", images: [] } }),
}));
