import { Input } from "@/shared/ui/input";
import { TooltipContainer } from "@/shared/components";
import { useImageUpload } from "@/features/chatEditor/hooks/useImageUpload";
import { Paperclip } from "lucide-react";

const ImageUploadButton = () => {
  const { uploadImage } = useImageUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const type = file.type;
      const fileName = file.name;

      const blob = await file.arrayBuffer();
      await uploadImage(blob, fileName, type);
    }
  };

  // 추후에 이미지 외의 파일 업로드 기능 추가 필요
  return (
    <TooltipContainer message="이미지 업로드">
      <label htmlFor="file-upload" className="rounded-full">
        <Input
          type="file"
          id="file-upload"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          aria-label="파일 업로드"
        />
        <span className="bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input/30 dark:hover:bg-input/50 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border shadow-xs">
          <Paperclip className="h-4 w-4" />
        </span>
      </label>
    </TooltipContainer>
  );
};

export default ImageUploadButton;
