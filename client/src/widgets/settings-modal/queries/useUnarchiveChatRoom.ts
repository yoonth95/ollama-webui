import { queryKeys, useCustomMutation } from "@/shared/api";
import { ChatRoomIdRequestSchema, ChatRoomIdRequestType } from "@/shared/types/chatRoomType";

const useUnarchiveChatRoom = (roomId: string) => {
  return useCustomMutation<undefined, ChatRoomIdRequestType>({
    endpoint: `/room/unarchive-room`,
    method: "PATCH",
    requestSchema: ChatRoomIdRequestSchema,
    queryKeyToRemove: queryKeys.rooms.list(),
    queryKeyToInvalidate: queryKeys.rooms.detail(roomId),
  });
};

export default useUnarchiveChatRoom;
