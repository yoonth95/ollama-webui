import { ChatRoomItem } from "@/widgets/layout/sidebar/components";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu } from "@/shared/ui/sidebar";
import { useGroupedChatRooms } from "@/widgets/layout/sidebar/hooks";
import { ChatRoomType } from "@/shared/types/chatRoomType";

type GroupRoomType = {
  category: string;
  items: ChatRoomType[];
};

interface ChatRoomGroupPropsType {
  chatRooms: ChatRoomType[];
}
const ChatRoomGroup = ({ chatRooms }: ChatRoomGroupPropsType) => {
  const groupedRooms = useGroupedChatRooms(chatRooms);

  return (
    <>
      {groupedRooms.map((group: GroupRoomType) => (
        <SidebarGroup key={group.category} className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>{group.category}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => (
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
