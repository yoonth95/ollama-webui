import { queryKeys, useCustomInfiniteQuery } from "@/shared/api";
import { ChatRoomSchema, ChatRoomType } from "@/shared/types/chatRoomType";
import { DisplayType } from "@/shared/types/apiType";

const useGetChatRooms = (type: DisplayType) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useCustomInfiniteQuery<ChatRoomType>({
    queryKey: queryKeys.rooms.list(),
    endpoint: "/room/get-rooms",
    schema: ChatRoomSchema,
    errorOptions: { type },
    options: { refetchOnWindowFocus: true },
  });

  const flatData = data?.pages.flatMap((page) => page.data?.items || []) || [];

  return {
    data: flatData || [],
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};

export default useGetChatRooms;
