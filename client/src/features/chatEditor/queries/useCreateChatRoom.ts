import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/shallow";
import { useEditorImageStore } from "@/features/chatEditor/stores/EditorImageStore";
import { queryKeys, useCustomMutation } from "@/shared/api";
import { useChatOptimisticStore } from "@/shared/stores/useChatOptimisticStore";
import useChatRoomStore from "@/shared/stores/useChatRoomStore";
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
  const addChatRoom = useChatRoomStore((state) => state.addChatRoom);
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
        const result = data.data;
        if (result) {
          clearImages();
          setIsCreateRoomLoading(false);

          addChatRoom({
            id: result.id,
            title: result.title,
            isArchived: result.isArchived,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
          });

          // 홈 페이지에서 채팅방 이동
          navigate(`/chat/${result.id}`);
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
