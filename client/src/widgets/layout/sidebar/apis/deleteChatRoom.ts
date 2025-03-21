import { customFetch } from "@/lib/customFetch";

const deleteChatRoom = async (room_id: string) => {
  const response = await customFetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/room/delete-room/${room_id}`,
    undefined,
    { method: "DELETE" },
  );
  return response;
};

export default deleteChatRoom;
