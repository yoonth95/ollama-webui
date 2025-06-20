import { create } from "zustand";

export type ModalType = "dialog" | "alert";

export interface ModalEntry {
  id: string;
  type: ModalType;
}

interface ModalStoreType {
  /** 모달 스택. 마지막 요소가 현재 화면에 표시되는 모달 */
  stack: ModalEntry[];

  /**
   * 새 모달을 스택에 푸시한다. 이미 존재하는 id 는 제거 후 푸시하여 중복을 방지한다.
   */
  open: (entry: ModalEntry) => void;

  /**
   * 스택 최상단(현재 모달)을 닫는다.
   */
  closeCurrent: () => void;

  /**
   * 특정 id 의 모달을 스택에서 제거한다.
   */
  closeById: (id: string) => void;

  /**
   * 모든 모달을 닫고 스택을 비운다.
   */
  clear: () => void;

  /**
   * 현재(스택 최상단) 모달 반환. 없으면 undefined
   */
  current: () => ModalEntry | undefined;

  /**
   * 전달된 id 가 현재 열린 모달인지 여부
   */
  isOpen: (id: string) => boolean;
  /** stack 포함 여부 */
  has: (id: string) => boolean;
}

export const useModalStore = create<ModalStoreType>((set, get) => ({
  stack: [],
  open: (entry) =>
    set((state) => {
      // 동일 id 제거 후 push
      const filtered = state.stack.filter((e) => e.id !== entry.id);
      return { stack: [...filtered, entry] };
    }),
  closeCurrent: () =>
    set((state) => {
      if (state.stack.length === 0) return state;
      return { stack: state.stack.slice(0, -1) };
    }),
  closeById: (id) =>
    set((state) => {
      return { stack: state.stack.filter((e) => e.id !== id) };
    }),
  clear: () => set({ stack: [] }),
  current: () => {
    const st = get().stack;
    return st[st.length - 1];
  },
  isOpen: (id: string) => {
    const st = get().stack;
    return st[st.length - 1]?.id === id;
  },
  has: (id: string) => {
    return get().stack.some((e) => e.id === id);
  },
}));
