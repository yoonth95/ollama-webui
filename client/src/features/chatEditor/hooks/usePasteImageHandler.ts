import { useImageUpload } from "./useImageUpload";

export const usePasteImageHandler = () => {
  const { uploadImage } = useImageUpload();

  const handlePasteImage = (event: ClipboardEvent) => {
    if (!event.clipboardData) return false;

    const items = event.clipboardData.items;
    const hasImage = Array.from(items).some((item) => item.type.indexOf("image") !== -1);
    const hasHtmlImage =
      event.clipboardData.types.includes("text/html") && event.clipboardData.getData("text/html").includes("<img");

    if (!hasImage && !hasHtmlImage) return false;

    event.preventDefault();

    // 비동기 처리를 즉시 실행
    (async () => {
      try {
        // 1. 클립보드 items에서 직접 이미지 파일 처리 (캡처 이미지, 로컬 파일)
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              const type = file.type || "image/png";
              const extension = type.split("/")[1] || "png";
              const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
              const fileName = `pasted-image-${timestamp}.${extension}`;

              await uploadImage(file, fileName, type);
              return;
            }
          }
        }

        // 2. HTML 이미지 처리 (외부 사이트 이미지)
        if (hasHtmlImage) {
          const html = event.clipboardData!.getData("text/html");
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          const img = doc.querySelector("img");

          if (img) {
            const src = img.getAttribute("src");
            if (src) {
              try {
                const response = await fetch(src);
                if (response.ok) {
                  const imageBlob = await response.blob();
                  const type = imageBlob.type || "image/png";
                  const extension = type.split("/")[1] || "png";
                  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
                  const fileName = `pasted-image-${timestamp}.${extension}`;

                  await uploadImage(imageBlob, fileName, type);
                }
              } catch (error) {
                console.error("이미지 다운로드 실패:", error);
              }
            }
          }
        }
      } catch (error) {
        console.error("클립보드 처리 중 오류:", error);
      }
    })();

    return true;
  };

  return handlePasteImage;
};
