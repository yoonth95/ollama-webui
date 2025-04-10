import { create } from "zustand";
import { ImageDataType } from "@/shared/types/chatMessageType";

export type ErrorType = "network" | "timeout" | "model" | "content" | "unknown";

interface ChatUIState {
  isOptimisticChatActive: boolean;
  pendingChatRoomId: string | null;
  pendingUserMessage: string;
  pendingUserImages: ImageDataType[];
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  errorType: ErrorType;
  botResponse: string;
  modelName: string | null;
  createdAt: string | null;
  isStreaming: boolean;

  setPendingChatRoomId: (id: string) => void;
  setPendingMessage: (content: string, images: ImageDataType[]) => void;
  activateOptimisticUI: () => void;
  deactivateOptimisticUI: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (hasError: boolean, errorMessage?: string, errorType?: ErrorType) => void;
  resetState: () => void;
  retryRequest: () => void;
  updateBotResponse: (content: string) => void;
  updateBotMetadata: (model: string | null, createdAt: string | null) => void;
  setIsStreaming: (isStreaming: boolean) => void;
}

export const useChatUIStore = create<ChatUIState>((set) => ({
  isOptimisticChatActive: false,
  pendingChatRoomId: null,
  pendingUserMessage: "",
  pendingUserImages: [],
  isLoading: false,
  hasError: false,
  errorMessage: "",
  errorType: "unknown",
  botResponse: "",
  modelName: null,
  createdAt: null,
  isStreaming: false,

  setPendingChatRoomId: (id) => set({ pendingChatRoomId: id }),

  setPendingMessage: (content, images) =>
    set({
      pendingUserMessage: content,
      pendingUserImages: images,
    }),

  activateOptimisticUI: () =>
    set({
      isOptimisticChatActive: true,
      isLoading: true,
      hasError: false,
      errorMessage: "",
      errorType: "unknown",
    }),

  deactivateOptimisticUI: () =>
    set({
      isOptimisticChatActive: false,
      isLoading: false,
      pendingUserMessage: "",
      pendingUserImages: [],
      pendingChatRoomId: null,
      botResponse: "",
      modelName: null,
      createdAt: null,
      isStreaming: false,
      hasError: false,
      errorMessage: "",
      errorType: "unknown",
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (hasError, errorMessage = "채팅방 생성에 실패했습니다.", errorType = "unknown") =>
    set({
      hasError,
      errorMessage,
      errorType,
      isLoading: false,
    }),

  resetState: () =>
    set({
      isOptimisticChatActive: false,
      pendingUserMessage: "",
      pendingUserImages: [],
      isLoading: false,
      hasError: false,
      errorMessage: "",
      errorType: "unknown",
      pendingChatRoomId: null,
      botResponse: "",
      modelName: null,
      createdAt: null,
      isStreaming: false,
    }),

  retryRequest: () =>
    set({
      isLoading: true,
      hasError: false,
      errorMessage: "",
      errorType: "unknown",
      botResponse: "",
    }),

  updateBotResponse: (content) => set({ botResponse: content }),
  updateBotMetadata: (model, createdAt) =>
    set({
      modelName: model,
      createdAt,
    }),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
}));
