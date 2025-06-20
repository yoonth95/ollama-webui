import { DialogContent, DialogDescription, DialogTitle } from "@/shared/ui/dialog";

const ImgDialogContent = ({ imageSrc, closeCurrent }: { imageSrc: string; closeCurrent: () => void }) => {
  return (
    <DialogContent
      className="gap-0 border-none bg-transparent outline-none"
      isCloseButton={false}
      style={{ maxWidth: "none" }}
      onClick={() => closeCurrent()}
    >
      <DialogTitle />
      <DialogDescription />
      <div className="flex h-full w-full items-center justify-center">
        <img
          src={imageSrc}
          alt="이미지 미리보기"
          className="max-h-[calc(100vh-10rem)] cursor-pointer rounded-xl object-contain shadow lg:w-fit"
        />
      </div>
    </DialogContent>
  );
};

export default ImgDialogContent;
