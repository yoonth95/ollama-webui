import { useModelSelectStore } from "@/shared/stores/useModelSelectStore";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import useCreateChatRoom from "@/features/chatEditor/queries/useCreateChatRoom";
import { useEditorImageStore } from "@/features/chatEditor/stores/EditorImageStore";
import { TiptapEditorRef } from "@/features/chatEditor/types/TiptapEditorType";

const TOAST_ID = "model-select-toast";

export const useMessageSubmit = (editorRef: React.RefObject<TiptapEditorRef | null> | undefined) => {
  const { chatRoomId } = useParams<{ chatRoomId?: string }>();

  const selectedModel = useModelSelectStore((state) => state.selectedModel);
  const { getImages, clearImages } = useEditorImageStore();

  const { mutate: createChatRoom, isPending: isCreatingRoom } = useCreateChatRoom();

  const handleSubmit = async () => {
    if (isCreatingRoom) return;

    if (!selectedModel) {
      if (!toast.isActive(TOAST_ID)) {
        toast.error("모델을 선택해주세요.", { toastId: TOAST_ID });
      }
      return;
    }

    // 이미지 또는 텍스트 중 하나만 있으면 됨
    const content = editorRef?.current?.getText() || "";
    const images = await getImages();

    if (images.length === 0 && !content) {
      if (!toast.isActive(TOAST_ID)) {
        toast.error("메시지를 입력해주세요.", { toastId: TOAST_ID });
      }
      return;
    }

    const body =
      images.length > 0 ? { model: selectedModel.model, content, images } : { model: selectedModel.model, content };

    // 홈 페이지에서 채팅 입력
    if (!chatRoomId) {
      createChatRoom(body);
    }
    // 채팅방 페이지에서 채팅 입력
    else {
      console.log("채팅방에서 메시지 입력");
      clearImages();
    }
  };

  return { handleSubmit, isPending: isCreatingRoom };
};
