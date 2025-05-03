import { useEffect } from "react";
import { useShallow } from "zustand/shallow";
import { useInView } from "react-intersection-observer";
import { ChatRoomItem, ChatRoomSkeleton } from "@/widgets/layout/sidebar/components";
import { useGetChatRooms } from "@/widgets/layout/sidebar/queries";
import { useGroupedChatRooms } from "@/widgets/layout/sidebar/hooks";
import { ChatItemType, GroupType } from "@/widgets/layout/sidebar/types/GroupRoomType";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu } from "@/shared/ui/sidebar";
import useChatRoomStore from "@/shared/stores/useChatRoomStore";
import { DisplayType } from "@/shared/types/apiType";
import { LoaderCircle } from "lucide-react";

const ChatRoomList = () => {
  const { ref, inView } = useInView();
  const {
    data: chatRoomsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useGetChatRooms(DisplayType.Toast);

  const [chatRooms, setChatRooms, addChatRooms] = useChatRoomStore(
    useShallow((state) => [state.chatRooms, state.setChatRooms, state.addChatRooms]),
  );

  const groupedChats = useGroupedChatRooms(chatRooms);

  // 초기 데이터 로딩 시 스토어에 저장
  useEffect(() => {
    if (chatRoomsData?.length > 0 && chatRooms.length === 0) {
      setChatRooms(chatRoomsData);
    }
  }, [chatRoomsData, chatRooms, setChatRooms]);

  // 무한 스크롤링 데이터 로드 처리
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      const fetchMore = async () => {
        try {
          const result = await fetchNextPage();
          if (result.data) {
            const newPages = result.data.pages;
            const latestPage = newPages[newPages.length - 1];
            if (latestPage?.data?.items && latestPage.data.items.length > 0) {
              addChatRooms(latestPage.data.items);
            }
          }
        } catch (error) {
          console.error("Error fetching more chat rooms:", error);
        }
      };

      fetchMore();
    }
  }, [inView, hasNextPage, isFetchingNextPage, addChatRooms, fetchNextPage]);

  if (isLoading || (chatRoomsData?.length > 0 && chatRooms.length === 0)) return <ChatRoomSkeleton />;
  if (isError) throw new Error("채팅방 조회 오류");

  return (
    <>
      {groupedChats.map((group: GroupType) => (
        <SidebarGroup key={group.category} className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>{group.category}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item: ChatItemType) => (
                <ChatRoomItem key={item.id} chat={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
      {(hasNextPage || isFetchingNextPage) && (
        <div ref={ref} className="text-muted-foreground flex justify-center text-sm">
          {isFetchingNextPage && <LoaderCircle className="h-4 w-4 animate-spin" />}
        </div>
      )}
    </>
  );
};

export default ChatRoomList;
