import { useCustomMutation } from "@/shared/api";
import { ChatRoomIdRequestSchema, ChatRoomIdRequestType } from "@/shared/types/chatRoomType";
import { queryKeys } from "@/shared/api";

const useUnarchiveChatRoom = (roomId: string) => {
  return useCustomMutation<undefined, ChatRoomIdRequestType>({
    endpoint: `/room/unarchive-room`,
    method: "PATCH",
    requestSchema: ChatRoomIdRequestSchema,
    queryKeyToInvalidate: [queryKeys.rooms.detail(roomId), queryKeys.rooms.list()],
  });
};

export default useUnarchiveChatRoom;
