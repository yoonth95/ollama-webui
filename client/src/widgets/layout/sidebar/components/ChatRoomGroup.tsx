import { ChatRoomItem } from "@/widgets/layout/sidebar/components";
import { ChatItemType, GroupType } from "@/widgets/layout/sidebar/types/GroupRoomType";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu } from "@/shared/ui/sidebar";
import { useGroupedChatRooms } from "@/widgets/layout/sidebar/hooks";
import { ChatRoomType } from "@/shared/types/chatRoomType";

const ChatRoomGroup = ({ chatRooms }: { chatRooms: ChatRoomType[] }) => {
  const groupedChats = useGroupedChatRooms(chatRooms);

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
    </>
  );
};

export default ChatRoomGroup;
