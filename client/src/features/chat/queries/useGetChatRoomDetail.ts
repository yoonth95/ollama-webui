import { useCustomQuery, queryKeys } from "@/shared/api";
import { ChatRoomSchema, ChatRoomType } from "@/shared/types/chatRoomType";

export const useGetChatRoomDetail = (chatRoomId: string) => {
  const result = useCustomQuery<ChatRoomType>({
    endpoint: `/room/${chatRoomId}`,
    schema: ChatRoomSchema,
    queryKey: queryKeys.rooms.detail(chatRoomId),
    options: {
      staleTime: 0,
      enabled: !!chatRoomId,
    },
  });

  return result;
};
