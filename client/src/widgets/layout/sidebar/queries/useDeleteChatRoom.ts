import { queryKeys, useCustomMutation } from "@/shared/api";
import { ChatRoomIdRequestSchema, ChatRoomIdRequestType } from "@/shared/types/chatRoomType";

const useDeleteChatRoom = () => {
  return useCustomMutation<undefined, undefined, ChatRoomIdRequestType>({
    endpoint: (params) => `/room/delete-room/${params?.roomId}`,
    method: "DELETE",
    paramsSchema: ChatRoomIdRequestSchema,
    showToastOnSuccess: true,
    queryKeyToRemove: queryKeys.rooms.list(),
  });
};

export default useDeleteChatRoom;
