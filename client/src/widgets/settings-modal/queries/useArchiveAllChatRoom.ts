import { queryKeys, useCustomMutation } from "@/shared/api";

const useArchiveAllChatRoom = () => {
  return useCustomMutation<undefined, undefined>({
    endpoint: `/room/archive-all`,
    method: "PUT",
    showToastOnSuccess: true,
    queryKeyToRemove: queryKeys.rooms.list(),
  });
};

export default useArchiveAllChatRoom;
