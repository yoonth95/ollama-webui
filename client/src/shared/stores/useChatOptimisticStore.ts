import { create } from "zustand";
import { ChatMessageType } from "@/shared/types/chatMessageType";

interface ChatOptimisticStoreType {
  isOptimistic: boolean;
  isCreateRoomLoading: boolean;
  isRetryLoading: boolean;
  isRetryCompleted: boolean;
  ChatDataList: ChatMessageType[];

  activateOptimisticUI: () => void;
  deactivateOptimisticUI: () => void;
  setIsCreateRoomLoading: (isCreateRoomLoading: boolean) => void;
  setIsRetryLoading: (isRetryLoading: boolean) => void;
  setIsRetryCompleted: (isRetryCompleted: boolean) => void;
  setChatDataList: (ChatDataList: ChatMessageType[]) => void;
  clearChatDataList: () => void;
}

export const useChatOptimisticStore = create<ChatOptimisticStoreType>((set) => ({
  isOptimistic: false,
  isCreateRoomLoading: false,
  isRetryLoading: false,
  isRetryCompleted: false,
  ChatDataList: [],

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

  setIsRetryLoading: (isRetryLoading) => set({ isRetryLoading }),
  setIsRetryCompleted: (isRetryCompleted) => set({ isRetryCompleted }),
  setIsCreateRoomLoading: (isCreateRoomLoading) => set({ isCreateRoomLoading }),
  setChatDataList: (ChatDataList) => set({ ChatDataList }),
  clearChatDataList: () => set({ ChatDataList: [] }),
}));
