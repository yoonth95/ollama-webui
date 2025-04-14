import { z } from "zod";
import { queryKeys, useCustomMutation } from "@/shared/api";

const deleteChatRoomSchema = z.object({
  roomId: z.string(),
});
type DeleteChatRoomParams = z.infer<typeof deleteChatRoomSchema>;

const useDeleteChatRoom = () => {
  return useCustomMutation<undefined, undefined, DeleteChatRoomParams>({
    endpoint: (params) => `/room/delete-room/${params?.roomId}`,
    method: "DELETE",
    paramsSchema: deleteChatRoomSchema,
    showToastOnSuccess: true,
    queryKeyToInvalidate: queryKeys.rooms.list(),
  });
};

export default useDeleteChatRoom;
