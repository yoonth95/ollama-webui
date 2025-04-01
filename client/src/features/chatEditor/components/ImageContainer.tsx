import { useEditorImageStore } from "@/features/chatEditor/stores/EditorImageStore";
import { ImageItem } from "@/features/chatEditor/components";

const ImageContainer = () => {
  const images = useEditorImageStore((state) => state.images);

  return (
    <>
      {images.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3">
          {images.map((image) => (
            <ImageItem key={image.id} image={image} />
          ))}
        </div>
      )}
    </>
  );
};

export default ImageContainer;
