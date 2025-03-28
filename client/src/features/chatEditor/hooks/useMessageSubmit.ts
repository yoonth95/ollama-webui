import { useModelSelectStore } from "@/shared/stores/useModelSelectStore";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { TiptapEditorRef } from "@/features/chatEditor/types/TiptapEditorType";
import useCreateChatRoom from "@/features/chatEditor/queries/useCreateChatRoom";

const TOAST_ID = "model-select-toast";

export const useMessageSubmit = (editorRef: React.RefObject<TiptapEditorRef | null> | undefined) => {
  const navigate = useNavigate();
  const { chatRoomId } = useParams<{ chatRoomId?: string }>();

  const selectedModel = useModelSelectStore((state) => state.selectedModel);

  const { mutate: createChatRoom, isPending: isCreatingRoom } = useCreateChatRoom();
  // const { mutate: sendMessage, isPending: isSendingMessage } = useSendMessage();

  const handleSubmit = () => {
    if (isCreatingRoom) return;

    if (!selectedModel) {
      if (!toast.isActive(TOAST_ID)) {
        toast.error("모델을 선택해주세요.", { toastId: TOAST_ID });
      }
      return;
    }
    const content = editorRef?.current?.getText();
    if (!content) return;

    const body = { model: selectedModel.model, message: content };
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
