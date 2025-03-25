import { useCustomMutation } from "@/shared/hooks/useApiQuery";
import { UpdateChatRoomTitleRequestSchema, UpdateChatRoomTitleRequestType } from "@/shared/types/chatRoomType";

const useUpdateChatRoomTitle = () => {
  return useCustomMutation<undefined, UpdateChatRoomTitleRequestType>({
    endpoint: `/room/update-room-title`,
    method: "PATCH",
    requestSchema: UpdateChatRoomTitleRequestSchema,
    showToastOnSuccess: true,
    queryKeyToInvalidate: ["chatRooms"],
  });
};

export default useUpdateChatRoomTitle;
