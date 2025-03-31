import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu } from "@/shared/ui/sidebar";
import { DisplayType } from "@/shared/types/apiType";
import { ChatRoomItem } from "@/widgets/layout/sidebar/components";
import { useGetChatRooms } from "@/widgets/layout/sidebar/queries";
import { useGroupedChatRooms } from "@/widgets/layout/sidebar/hooks";
import { ChatItemType, GroupType } from "@/widgets/layout/sidebar/types/GroupRoomType";
import { LoaderCircle } from "lucide-react";

const ChatRoomList = () => {
  const { ref, inView } = useInView();
  const { data: chatRooms, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetChatRooms(DisplayType.Toast);
  const groupedChats = useGroupedChatRooms(chatRooms || []);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

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
