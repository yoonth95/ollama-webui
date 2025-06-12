import { create } from "zustand";

interface DialogVisibilityStoreType {
  isSettingsVisible: boolean;
  setSettingsVisible: (visible: boolean) => void;
}

export const useDialogVisibility = create<DialogVisibilityStoreType>((set) => ({
  isSettingsVisible: true,
  setSettingsVisible: (visible) => set({ isSettingsVisible: visible }),
}));
