import { queryKeys, useCustomMutation } from "@/shared/api";

const useDeleteAllChatRoom = () => {
  return useCustomMutation<undefined, undefined>({
    endpoint: `/room/delete-all`,
    method: "DELETE",
    showToastOnSuccess: true,
    queryKeyToRemove: queryKeys.rooms.list(),
  });
};

export default useDeleteAllChatRoom;
