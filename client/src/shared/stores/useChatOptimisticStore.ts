import { create } from "zustand";
import { ChatMessageType } from "@/shared/types/chatMessageType";

type RetryType = "empty" | "error" | "regenerate" | null;

interface ChatOptimisticStoreType {
  isOptimistic: boolean;
  isCreateRoomLoading: boolean;

  isRetryLoading: boolean;
  isRetryCompleted: boolean;
  retriedAssistantId: string | null;
  retryType: RetryType;

  ChatDataList: ChatMessageType[];

  activateOptimisticUI: () => void;
  deactivateOptimisticUI: () => void;
  setIsCreateRoomLoading: (isCreateRoomLoading: boolean) => void;

  setRetryInfo: (assistantId: string | null, type: RetryType) => void;
  setIsRetryLoading: (isRetryLoading: boolean) => void;
  setIsRetryCompleted: (isRetryCompleted: boolean) => void;
  clearRetryInfo: () => void;

  setChatDataList: (ChatDataList: ChatMessageType[]) => void;
  clearChatDataList: () => void;
}

export const useChatOptimisticStore = create<ChatOptimisticStoreType>((set) => ({
  isOptimistic: false,
  isCreateRoomLoading: false,
  isRetryLoading: false,
  isRetryCompleted: false,
  retriedAssistantId: null,
  retryType: null,
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

  setRetryInfo: (assistantId, type) =>
    set({
      isRetryLoading: true,
      retriedAssistantId: assistantId,
      retryType: type,
      isRetryCompleted: false,
    }),

  clearRetryInfo: () =>
    set({
      isRetryLoading: false,
      retriedAssistantId: null,
      retryType: null,
      isRetryCompleted: true,
    }),

  setIsRetryCompleted: (isRetryCompleted) => set({ isRetryCompleted }),
  setIsRetryLoading: (isRetryLoading) => set({ isRetryLoading }),
  setIsCreateRoomLoading: (isCreateRoomLoading) => set({ isCreateRoomLoading }),
  setChatDataList: (ChatDataList) => set({ ChatDataList }),
  clearChatDataList: () => set({ ChatDataList: [] }),
}));
