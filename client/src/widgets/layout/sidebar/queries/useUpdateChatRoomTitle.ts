import { queryKeys, useCustomMutation } from "@/shared/api";
import { UpdateChatRoomTitleRequestSchema, UpdateChatRoomTitleRequestType } from "@/shared/types/chatRoomType";

const useUpdateChatRoomTitle = () => {
  return useCustomMutation<undefined, UpdateChatRoomTitleRequestType>({
    endpoint: `/room/update-room-title`,
    method: "PATCH",
    requestSchema: UpdateChatRoomTitleRequestSchema,
    showToastOnSuccess: true,
    queryKeyToInvalidate: queryKeys.rooms.list(),
  });
};

export default useUpdateChatRoomTitle;
