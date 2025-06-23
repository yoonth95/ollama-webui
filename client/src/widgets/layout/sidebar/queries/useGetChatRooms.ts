import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { queryKeys, useCustomInfiniteQuery } from "@/shared/api";
import useChatRoomStore from "@/shared/stores/useChatRoomStore";
import { ChatRoomInfiniteSchema, ChatRoomInfiniteType } from "@/shared/types/chatRoomType";
import { DisplayType } from "@/shared/types/apiType";

const useGetChatRooms = (type: DisplayType) => {
  const [chatRooms, setChatRooms, syncChatRooms] = useChatRoomStore(
    useShallow((state) => [state.chatRooms, state.setChatRooms, state.syncChatRooms]),
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch } =
    useCustomInfiniteQuery<ChatRoomInfiniteType>({
      queryKey: queryKeys.rooms.list(),
      endpoint: "/room/get-rooms",
      schema: ChatRoomInfiniteSchema,
      errorOptions: { type },
      options: { refetchOnWindowFocus: true },
    });

  const flatData = useMemo(() => data?.pages.flatMap((page) => page.data?.items || []) || [], [data]);

  useEffect(() => {
    if (flatData.length === 0) return;

    if (chatRooms.length === 0) setChatRooms(flatData);
    else syncChatRooms(flatData);
  }, [flatData, chatRooms, setChatRooms, syncChatRooms]);

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

export default useGetChatRooms;
