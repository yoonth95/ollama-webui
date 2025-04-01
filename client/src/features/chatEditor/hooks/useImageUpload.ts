import { toast } from "react-toastify";
import { useEditorImageStore } from "@/features/chatEditor/stores/EditorImageStore";

export const useImageUpload = () => {
  const addImage = useEditorImageStore((state) => state.addImage);

  const uploadImage = async (blobData: Blob | ArrayBuffer, fileName: string, fileType: string) => {
    try {
      // ArrayBuffer인 경우 Blob으로 변환
      const blob = blobData instanceof ArrayBuffer ? new Blob([blobData], { type: fileType }) : blobData;
      const file = new File([blob], fileName, { type: fileType });

      const { success, error } = addImage({
        url: URL.createObjectURL(blob),
        file,
      });

      if (!success) toast.error(error);
      return { success, error };
    } catch (e) {
      console.error("유효하지 않는 이미지입니다.", e);
      toast.error("유효하지 않는 이미지입니다.");
      return { success: false, error: "유효하지 않는 이미지입니다." };
    }
  };

  return { uploadImage };
};
