import { useNavigate } from "react-router-dom";
import { queryKeys, useCustomMutation } from "@/shared/api";
import { useEditorImageStore } from "@/features/chatEditor/stores/EditorImageStore";
import { useChatUIStore } from "@/shared/stores/useChatUIStore";
import { ImageDataType } from "@/shared/types/chatMessageType";
import {
  ChatRoomSchema,
  ChatRoomType,
  CreateChatRoomRequestSchema,
  CreateChatRoomRequestType,
} from "@/shared/types/chatRoomType";

const useCreateChatRoom = () => {
  const navigate = useNavigate();
  const { clearImages } = useEditorImageStore();
  const { setPendingMessage, activateOptimisticUI, setPendingChatRoomId } = useChatUIStore();

  return useCustomMutation<ChatRoomType, CreateChatRoomRequestType>({
    endpoint: `/room/create-room`,
    method: "POST",
    responseSchema: ChatRoomSchema,
    requestSchema: CreateChatRoomRequestSchema,
    queryKeyToInvalidate: queryKeys.rooms.list(),
    options: {
      onMutate: (variable) => {
        if (!variable) return;

        let content = "";
        let images: ImageDataType[] = [];

        if ("content" in variable) {
          content = variable.content;
          images = variable.images || [];
        } else if (variable.data) {
          content = variable.data.content || "";
          images = variable.data.images || [];
        }

        setPendingMessage(content, images);
        activateOptimisticUI();
      },
      onSuccess: (data) => {
        if (data.data?.id) {
          setPendingChatRoomId(data.data.id);
          navigate(`/chat/${data.data.id}`);
          clearImages();
        }
      },
    },
  });
};

export default useCreateChatRoom;
