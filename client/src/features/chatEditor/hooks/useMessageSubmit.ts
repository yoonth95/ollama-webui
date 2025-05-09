import { toast } from "react-toastify";
import useCreateChatRoom from "@/features/chatEditor/queries/useCreateChatRoom";
import { useEditorImageStore } from "@/features/chatEditor/stores/EditorImageStore";
import { TiptapEditorRef } from "@/features/chatEditor/types/TiptapEditorType";
import { useSSEEventSourceStore } from "@/shared/stores/useSSEEventSourceStore";
import { useModelSelectStore } from "@/shared/stores/useModelSelectStore";

const TOAST_ID = "model-select-toast";

interface MessageSubmitPropsType {
  editorRef: React.RefObject<TiptapEditorRef | null> | undefined;
  chatRoomId: string;
}
export const useMessageSubmit = ({ editorRef, chatRoomId }: MessageSubmitPropsType) => {
  const selectedModel = useModelSelectStore((state) => state.selectedModel);
  const getImages = useEditorImageStore((state) => state.getImages);
  const isStartSSE = useSSEEventSourceStore((state) => state.isStartSSE["chat"] ?? false);

  const { mutate: createChatRoom, isPending: isCreatingRoom } = useCreateChatRoom();

  // 채팅방 내에서 메시지 전송을 위한 mutation
  // TODO: 커스텀 훅으로 분리

  const handleSubmit = async () => {
    // 채팅방 생성 중이거나, 응답(답변) 수신 중이면 비활성화
    if (isCreatingRoom || isStartSSE) return;

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

    // 홈 페이지에서 채팅 입력 - 새 채팅방 생성
    if (!chatRoomId) {
      createChatRoom(body);
    }
    // 채팅방 페이지에서 채팅 입력
    else {
      // TODO: 채팅방 페이지에서 채팅 입력 시 메시지 전송 로직 추가
      // sendMessage({ data: body });
    }
  };

  return { handleSubmit, isPending: isCreatingRoom };
};
