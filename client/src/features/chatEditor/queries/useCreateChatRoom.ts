import { queryKeys, useCustomMutation } from "@/shared/api";
import {
  ChatRoomSchema,
  ChatRoomType,
  CreateChatRoomRequestSchema,
  CreateChatRoomRequestType,
} from "@/shared/types/chatRoomType";

const useCreateChatRoom = () => {
  return useCustomMutation<ChatRoomType, CreateChatRoomRequestType>({
    endpoint: `/room/create-room`,
    method: "POST",
    responseSchema: ChatRoomSchema,
    requestSchema: CreateChatRoomRequestSchema,
    queryKeyToInvalidate: queryKeys.rooms.list(),
  });
};

export default useCreateChatRoom;
