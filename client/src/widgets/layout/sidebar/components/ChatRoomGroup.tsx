import { ChatRoomItem } from "@/widgets/layout/sidebar/components";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu } from "@/shared/ui/sidebar";
import { useGroupedChatRooms } from "@/widgets/layout/sidebar/hooks";
import { ChatRoomType, GroupChatRoomType } from "@/shared/types/chatRoomType";

interface ChatRoomGroupPropsType {
  chatRooms: ChatRoomType[];
}
const ChatRoomGroup = ({ chatRooms }: ChatRoomGroupPropsType) => {
  const groupedRooms = useGroupedChatRooms(chatRooms);

  return (
    <>
      {groupedRooms.map((group: GroupChatRoomType) => (
        <SidebarGroup key={group.category} className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>{group.category}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => (
                <ChatRoomItem key={item.id} room={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
};

export default ChatRoomGroup;
