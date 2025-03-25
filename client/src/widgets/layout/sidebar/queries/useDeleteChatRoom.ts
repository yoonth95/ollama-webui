import { queryKeys, useCustomMutation } from "@/shared/api";

const useDeleteChatRoom = () => {
  return useCustomMutation({
    endpoint: (params) => `/room/delete-room/${params?.roomId}`,
    method: "DELETE",
    showToastOnSuccess: true,
    queryKeyToInvalidate: queryKeys.rooms.list(),
  });
};

export default useDeleteChatRoom;
