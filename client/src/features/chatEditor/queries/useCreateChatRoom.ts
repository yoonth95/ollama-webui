import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/shallow";
import { useEditorImageStore } from "@/features/chatEditor/stores/EditorImageStore";
import { queryKeys, useCustomMutation } from "@/shared/api";
import { useChatOptimisticStore } from "@/shared/stores/useChatOptimisticStore";
import { useSSEEventSourceStore } from "@/shared/stores/useSSEEventSourceStore";
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
  const [activateOptimisticUI, deactivateOptimisticUI, setChatDataList, clearChatDataList, setIsCreateRoomLoading] =
    useChatOptimisticStore(
      useShallow((state) => [
        state.activateOptimisticUI,
        state.deactivateOptimisticUI,
        state.setChatDataList,
        state.clearChatDataList,
        state.setIsCreateRoomLoading,
      ]),
    );

  const setIsStartSSE = useSSEEventSourceStore((state) => state.setIsStartSSE);

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
        let model = "";

        if ("content" in variable) {
          content = variable.content;
          images = variable.images || [];
          model = variable.model || "";
        } else if (variable.data) {
          content = variable.data.content || "";
          images = variable.data.images || [];
          model = variable.data.model || "";
        }

        activateOptimisticUI();
        setChatDataList([
          {
            id: `user-${Date.now()}`,
            roomId: "",
            role: "user",
            model,
            content,
            images,
            errorType: null,
            errorMessage: null,
            userMessageId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: `assistant-${Date.now()}`,
            roomId: "",
            role: "assistant",
            model,
            content: "",
            images: [],
            errorType: null,
            errorMessage: null,
            userMessageId: null,
            createdAt: "",
            updatedAt: "",
          },
        ]);
      },
      onSuccess: (data) => {
        if (data.data?.id) {
          clearImages();
          setIsCreateRoomLoading(false);
          setIsStartSSE("chat", true);

          // 홈 페이지에서 채팅방 이동
          navigate(`/chat/${data.data.id}`);
        }
      },
      onError: (error) => {
        console.error("채팅방 생성 오류:", error);
        clearChatDataList();
        deactivateOptimisticUI();
      },
    },
  });
};

export default useCreateChatRoom;
