import { DisplayType } from "@/shared/hooks/useApiError";
import { useCustomInfiniteQuery } from "@/shared/hooks/useApiQuery";
import { ChatRoomSchema, ChatRoomType } from "@/shared/types/chatRoomType";

const useGetChatRooms = (type: DisplayType) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useCustomInfiniteQuery<ChatRoomType>({
    queryKey: ["chatRooms"],
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
