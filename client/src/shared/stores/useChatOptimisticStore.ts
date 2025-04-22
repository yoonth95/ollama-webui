import { create } from "zustand";
import { ImageDataType } from "@/shared/types/chatMessageType";

export type userChatDataType = {
  content: string;
  images: ImageDataType[];
};

interface ChatOptimisticStoreType {
  isOptimistic: boolean;
  isCreateRoomLoading: boolean;
  userChatData: userChatDataType;

  activateOptimisticUI: () => void;
  deactivateOptimisticUI: () => void;
  setIsCreateRoomLoading: (isCreateRoomLoading: boolean) => void;
  setUserChatData: (userChatData: userChatDataType) => void;
  clearUserChatData: () => void;
}

export const useChatOptimisticStore = create<ChatOptimisticStoreType>((set) => ({
  isOptimistic: false,
  isCreateRoomLoading: false,
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
    }),

  setIsCreateRoomLoading: (isCreateRoomLoading) => set({ isCreateRoomLoading }),
  setUserChatData: (userChatData) => set({ userChatData }),
  clearUserChatData: () => set({ userChatData: { content: "", images: [] } }),
}));
