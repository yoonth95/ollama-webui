import { toast } from "react-toastify";
import { useModelDownloadStore } from "@/widgets/layout/header/stores/useModelDownloadStore";
import { X } from "lucide-react";

const CancelModelButton = ({ model_name }: { model_name: string }) => {
  const { cancelDownload } = useModelDownloadStore();

  const handleModelDownloadCancel = async (model_name: string) => {
    try {
      cancelDownload(model_name);
      toast.success(`"${model_name}" 다운로드가 취소되었습니다.`);
    } catch (error) {
      console.error("다운로드 취소 중 오류 발생:", error);
      toast.error("다운로드 취소에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <X
      className="h-4 w-4 cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        handleModelDownloadCancel(model_name);
      }}
    />
  );
};

export default CancelModelButton;
