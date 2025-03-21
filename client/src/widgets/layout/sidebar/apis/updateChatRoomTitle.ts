import { customFetch } from "@/lib/customFetch";

const updateChatRoomTitle = async (roomId: string, newTitle: string) => {
  const bodyData = {
    room_id: roomId,
    new_title: newTitle,
  };

  return customFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/room/update-room-title`, undefined, {
    method: "PATCH",
    body: bodyData,
  });
};

export default updateChatRoomTitle;
