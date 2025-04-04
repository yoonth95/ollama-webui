import { ReactNode, useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useImageUpload } from "@/features/chatEditor/hooks/useImageUpload";
import { ImagePlus } from "lucide-react";

interface MainDropzoneProps {
  children: ReactNode;
}

export function MainDropzone({ children }: MainDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { uploadImage } = useImageUpload();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        uploadImage(file, file.name, file.type);
      });
      setIsDragging(false);
    },
    [uploadImage],
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  // 추후에 이미지 외의 파일 업로드 기능 추가 필요
  return (
    <div className="flex flex-1 flex-col" {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs">
          <div className="bg-accent text-accent-foreground flex h-42 w-[25rem] flex-col items-center justify-center gap-3 rounded-lg p-6 text-center transition-colors duration-200">
            <ImagePlus className="text-muted-foreground h-8 w-8" />
            <div className="flex flex-col gap-1">
              <p className="text-md">이미지 파일 추가</p>
              <p className="text-muted-foreground text-sm">이미지 파일을 여기로 드롭하여 대화에 추가하세요</p>
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
