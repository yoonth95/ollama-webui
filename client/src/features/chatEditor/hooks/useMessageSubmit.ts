import { useModelSelectStore } from "@/shared/stores/useModelSelectStore";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { TiptapEditorRef } from "@/features/chatEditor/types/TiptapEditorType";
import useCreateChatRoom from "@/features/chatEditor/queries/useCreateChatRoom";
import { useEditorImageStore } from "@/features/chatEditor/stores/EditorImageStore";

const TOAST_ID = "model-select-toast";

export const useMessageSubmit = (editorRef: React.RefObject<TiptapEditorRef | null> | undefined) => {
  const navigate = useNavigate();
  const { chatRoomId } = useParams<{ chatRoomId?: string }>();

  const selectedModel = useModelSelectStore((state) => state.selectedModel);
  const getImages = useEditorImageStore((state) => state.getImages);

  const { mutate: createChatRoom, isPending: isCreatingRoom } = useCreateChatRoom();
  // const { mutate: sendMessage, isPending: isSendingMessage } = useSendMessage();

  const handleSubmit = async () => {
    if (isCreatingRoom) return;

    if (!selectedModel) {
      if (!toast.isActive(TOAST_ID)) {
        toast.error("모델을 선택해주세요.", { toastId: TOAST_ID });
      }
      return;
    }
    const content = editorRef?.current?.getText();
    if (!content) return;

    const images = await getImages();

    const body =
      images.length > 0 ? { model: selectedModel.model, content, images } : { model: selectedModel.model, content };

    if (!chatRoomId) {
      createChatRoom(body, {
        onSuccess: (data) => navigate(`/chat/${data.data?.id}`),
      });
    } else {
      console.log("채팅방에서 메시지 입력");
    }
  };

  return { handleSubmit, isPending: isCreatingRoom };
};
