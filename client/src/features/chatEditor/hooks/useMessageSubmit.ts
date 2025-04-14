import { useModelSelectStore } from "@/shared/stores/useModelSelectStore";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import useCreateChatRoom from "@/features/chatEditor/queries/useCreateChatRoom";
import { useEditorImageStore } from "@/features/chatEditor/stores/EditorImageStore";
import { TiptapEditorRef } from "@/features/chatEditor/types/TiptapEditorType";
import { useChatOptimisticStore } from "@/shared/stores/useChatOptimisticStore";
import { queryKeys, useCustomMutation } from "@/shared/api";
import { ImageDataType } from "@/shared/types/chatMessageType";

const TOAST_ID = "model-select-toast";

interface MessageBody {
  model: string;
  content: string;
  images?: ImageDataType[];
}

interface MessageResponse {
  id: string;
  content: string;
  model: string;
  createdAt: string;
}

export const useMessageSubmit = (editorRef: React.RefObject<TiptapEditorRef | null> | undefined) => {
  const { chatRoomId } = useParams<{ chatRoomId?: string }>();

  const selectedModel = useModelSelectStore((state) => state.selectedModel);
  const getImages = useEditorImageStore((state) => state.getImages);
  const { activateOptimisticUI, setUserChatData } = useChatOptimisticStore();

  const { mutate: createChatRoom, isPending: isCreatingRoom } = useCreateChatRoom();

  // 채팅방 내에서 메시지 전송을 위한 mutation
  // TODO: 커스텀 훅으로 분리
  const { mutate: sendMessage, isPending: isSendingMessage } = useCustomMutation<MessageResponse, MessageBody>({
    endpoint: `/chat/${chatRoomId}/send`,
    method: "POST",
    queryKeyToInvalidate: queryKeys.chats.messages(chatRoomId || ""),
    options: {
      onMutate: (variable) => {
        if (!variable) return;

        // 최적화된 UI 업데이트를 위한 상태 변경
        activateOptimisticUI();

        let content = "";
        let images: ImageDataType[] = [];

        if ("data" in variable && variable.data) {
          content = variable.data.content || "";
          images = variable.data.images || [];
        }

        setUserChatData({
          content,
          images,
        });
      },
    },
  });

  const handleSubmit = async () => {
    if (isCreatingRoom || isSendingMessage) return;

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

    const body: MessageBody =
      images.length > 0 ? { model: selectedModel.model, content, images } : { model: selectedModel.model, content };

    // 홈 페이지에서 채팅 입력 - 새 채팅방 생성
    if (!chatRoomId) {
      createChatRoom(body);
    }
    // 채팅방 페이지에서 채팅 입력
    else {
      sendMessage({ data: body });
    }
  };

  return { handleSubmit, isPending: isCreatingRoom || isSendingMessage };
};
