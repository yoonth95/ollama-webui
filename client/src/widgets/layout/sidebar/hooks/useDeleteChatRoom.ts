import { useCustomMutation } from "@/shared/hooks/useApiQuery";

const useDeleteChatRoom = () => {
  return useCustomMutation({
    endpoint: (params) => `/room/delete-room/${params?.roomId}`,
    method: "DELETE",
    showToastOnSuccess: true,
    queryKeyToInvalidate: ["chatRooms"],
  });
};

export default useDeleteChatRoom;
