import { queryKeys, useCustomMutation } from "@/shared/api";
import { ChatRoomIdRequestSchema, ChatRoomIdRequestType } from "@/shared/types/chatRoomType";

const useArchiveChatRoom = () => {
  return useCustomMutation<undefined, ChatRoomIdRequestType>({
    endpoint: `/room/archive-room`,
    method: "PATCH",
    requestSchema: ChatRoomIdRequestSchema,
    showToastOnSuccess: true,
    queryKeyToRemove: queryKeys.rooms.list(),
  });
};

export default useArchiveChatRoom;
