import { queryKeys, useCustomInfiniteQuery } from "@/shared/api";
import { ChatRoomInfiniteSchema, ChatRoomInfiniteType } from "@/shared/types/chatRoomType";
import { DisplayType } from "@/shared/types/apiType";

const useGetChatRooms = (type: DisplayType) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useCustomInfiniteQuery<ChatRoomInfiniteType>({
    queryKey: queryKeys.rooms.list(),
    endpoint: "/room/get-rooms",
    schema: ChatRoomInfiniteSchema,
    errorOptions: { type },
    options: { refetchOnWindowFocus: true },
  });

  const flatData = data?.pages.flatMap((page) => page.data?.items || []) || [];

  return {
    data: flatData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};

export default useGetChatRooms;
