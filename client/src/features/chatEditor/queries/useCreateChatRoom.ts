import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/shallow";
import { useEditorImageStore } from "@/features/chatEditor/stores/EditorImageStore";
import { queryKeys, useCustomMutation } from "@/shared/api";
import { useChatOptimisticStore } from "@/shared/stores/useChatOptimisticStore";
import { ImageDataType } from "@/shared/types/chatMessageType";
import {
  ChatRoomSchema,
  ChatRoomType,
  CreateChatRoomRequestSchema,
  CreateChatRoomRequestType,
} from "@/shared/types/chatRoomType";

const useCreateChatRoom = () => {
  const navigate = useNavigate();
  const clearImages = useEditorImageStore((state) => state.clearImages);
  const [activateOptimisticUI, deactivateOptimisticUI, setUserChatData, clearUserChatData, setCreateRoomLoading] =
    useChatOptimisticStore(
      useShallow((state) => [
        state.activateOptimisticUI,
        state.deactivateOptimisticUI,
        state.setUserChatData,
        state.clearUserChatData,
        state.setCreateRoomLoading,
      ]),
    );

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

        // UI 업데이트
        activateOptimisticUI();
        setUserChatData({
          content,
          images,
        });
      },
      onSuccess: (data) => {
        if (data.data?.id) {
          clearImages();
          setCreateRoomLoading(false);

          // 홈 페이지에서 채팅방 이동
          navigate(`/chat/${data.data.id}`);
        }
      },
      onError: (error) => {
        console.error("채팅방 생성 오류:", error);
        clearUserChatData();
        deactivateOptimisticUI();
      },
    },
  });
};

export default useCreateChatRoom;
