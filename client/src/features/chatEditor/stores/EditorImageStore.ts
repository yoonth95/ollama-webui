import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { isValidImageType } from "@/features/chatEditor/utils/imageUtil";

export interface ImageItemType {
  id: string;
  url: string;
  file: File;
}

interface EditorImageState {
  images: ImageItemType[];
  addImage: (image: Omit<ImageItemType, "id">) => { success: boolean; error?: string };
  removeImage: (id: string) => void;
  clearImages: () => void;
  getImages: () => Promise<string[]>;
}

// 이미지 고유 ID 생성
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// File을 Base64로 변환하는 유틸리티 함수
const fileToBase64 = (file: File): Promise<{ data: string; type: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const parts = reader.result.split(",");
        const mime = parts[0].match(/:(.*?);/)?.[1] || "";
        const base64 = parts[1];
        resolve({ data: base64, type: mime });
      } else {
        reject(new Error("FileReader 결과가 문자열이 아닙니다."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

// Zustand 스토어 생성
export const useEditorImageStore = create<EditorImageState>()(
  devtools(
    (set, get) => ({
      images: [],

      // 이미지 추가
      addImage: (image) => {
        if (!image.file.type.includes("image")) {
          return { success: false, error: "이미지 파일만 업로드 가능합니다." };
        }
        if (!isValidImageType(image.file.type)) {
          return { success: false, error: "지원하지 않는 이미지 형식입니다." };
        }

        set(
          (state) => ({
            images: [...state.images, { ...image, id: generateId() }],
          }),
          false,
          "addImage",
        );

        return { success: true };
      },

      // 이미지 삭제
      removeImage: (id) => {
        const imageToRemove = get().images.find((img) => img.id === id);

        // URL 해제
        if (imageToRemove?.url.startsWith("blob:")) {
          URL.revokeObjectURL(imageToRemove.url);
        }

        set(
          (state) => ({
            images: state.images.filter((image) => image.id !== id),
          }),
          false,
          "removeImage",
        );
      },

      // 모든 이미지 제거
      clearImages: () => {
        // 모든 Blob URL 해제
        get().images.forEach((image) => {
          if (image.url.startsWith("blob:")) {
            URL.revokeObjectURL(image.url);
          }
        });

        set({ images: [] }, false, "clearImages");
      },

      // 현재 이미지 리스트에서 base64로 인코딩된 이미지 리스트 반환
      getImages: async () => {
        const images = get().images;
        const base64DataList = await Promise.all(
          images.map(async (image) => {
            const { data } = await fileToBase64(image.file);
            return data;
          }),
        );
        return base64DataList;
      },
    }),
    { name: "editor-image-store" },
  ),
);
