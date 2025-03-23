import { create } from "zustand";

export interface DigestWithProgressType {
  model_name: string;
  digest: string | undefined;
  progress: number;
}

interface ModelDownloadState {
  // 각 모델의 다운로드 진행 상태를 추적
  downloads: {
    [key: string]: DigestWithProgressType;
  };

  // 각 모델의 다운로드 pending 상태를 추적
  pendingDownloads: Set<string>;

  // 각 모델의 AbortController를 추적
  controllers: {
    [key: string]: AbortController;
  };

  // Actions
  startDownload: (modelName: string) => AbortController;
  updateProgress: (progressData: DigestWithProgressType) => void;
  finishOrCancelDownload: (modelName: string) => void;
  getController: (modelName: string) => AbortController | null;
  cancelDownload: (modelName: string) => void;
}

export const useModelDownloadStore = create<ModelDownloadState>((set, get) => ({
  downloads: {},
  pendingDownloads: new Set(),
  controllers: {},

  // 다운로드 시작
  startDownload: (modelName) => {
    const controller = new AbortController();

    set((state) => {
      const newPendingDownloads = new Set(state.pendingDownloads);
      newPendingDownloads.add(modelName);

      return {
        pendingDownloads: newPendingDownloads,
        downloads: {
          ...state.downloads,
          [modelName]: {
            model_name: modelName,
            digest: undefined,
            progress: 0,
          },
        },
        controllers: {
          ...state.controllers,
          [modelName]: controller,
        },
      };
    });

    return controller;
  },

  // 다운로드 진행 상태 업데이트
  updateProgress: (progressData) =>
    set((state) => ({
      downloads: {
        ...state.downloads,
        [progressData.model_name]: progressData,
      },
    })),

  // 다운로드 완료 또는 취소
  finishOrCancelDownload: (modelName) =>
    set((state) => {
      const newPendingDownloads = new Set(state.pendingDownloads);
      newPendingDownloads.delete(modelName);

      const newDownloads = { ...state.downloads };
      delete newDownloads[modelName];

      const newControllers = { ...state.controllers };
      delete newControllers[modelName];

      return {
        pendingDownloads: newPendingDownloads,
        downloads: newDownloads,
        controllers: newControllers,
      };
    }),

  // 특정 모델의 controller 가져오기
  getController: (modelName) => {
    const state = get();
    return state.controllers[modelName] || null;
  },

  // 다운로드 취소
  cancelDownload: (modelName) => {
    const controller = get().controllers[modelName];
    if (controller) {
      controller.abort();
    }
  },
}));
