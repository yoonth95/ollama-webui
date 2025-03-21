import { customFetch } from "@/lib/customFetch";
import { ChatRoomArraySchema, ChatRoomType } from "@/types/chatRoomType";

export type ChatRoomsParams = {
  page?: number;
  limit?: number;
};

export const getChatRooms = async ({ page = 1, limit = 20 }: ChatRoomsParams = {}) => {
  const response = await customFetch<ChatRoomType[]>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/room/get-rooms?page=${page}&limit=${limit}`,
    ChatRoomArraySchema,
    {
      cache: "no-store",
    },
  );
  const { data } = response;
  return data || [];
};
export default getChatRooms;
