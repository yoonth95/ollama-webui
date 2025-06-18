import { useShallow } from "zustand/shallow";
import { ChatRoomGroup, ChatRoomLoader, SidebarError, ChatRoomSkeleton } from "@/widgets/layout/sidebar/components";
import { useChatRoomInfiniteScroll } from "@/widgets/layout/sidebar/hooks";
import { useGetChatRooms } from "@/widgets/layout/sidebar/queries";
import useChatRoomStore from "@/shared/stores/useChatRoomStore";
import { DisplayType } from "@/shared/types/apiType";

const ChatRoomList = () => {
  const {
    data: chatRoomsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useGetChatRooms(DisplayType.Display);

  const [chatRooms, addChatRooms] = useChatRoomStore(useShallow((state) => [state.chatRooms, state.addChatRooms]));

  const {
    loaderRef,
    hasMoreData,
    isLoading: isLoadingMore,
  } = useChatRoomInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    onFetchSuccess: addChatRooms,
  });

  if (isLoading || (chatRoomsData?.length > 0 && chatRooms.length === 0)) return <ChatRoomSkeleton />;
  if (isError) return <SidebarError refetch={refetch} />;

  return (
    <>
      <ChatRoomGroup chatRooms={chatRooms} />
      {(hasMoreData || isLoadingMore) && <ChatRoomLoader loaderRef={loaderRef} />}
    </>
  );
};

export default ChatRoomList;
