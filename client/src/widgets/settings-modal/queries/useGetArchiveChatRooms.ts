import { useMemo } from "react";
import { useCustomInfiniteQuery, queryKeys } from "@/shared/api";
import { ChatRoomInfiniteSchema, ChatRoomInfiniteType } from "@/shared/types/chatRoomType";

export const useGetArchiveChatRooms = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch } =
    useCustomInfiniteQuery<ChatRoomInfiniteType>({
      queryKey: queryKeys.rooms.list(),
      endpoint: "/room/get-archived-rooms",
      schema: ChatRoomInfiniteSchema,
      options: { refetchOnWindowFocus: true },
    });

  const flatData = useMemo(() => data?.pages.flatMap((page) => page.data?.items || []) || [], [data]);

  return {
    data: flatData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  };
};
