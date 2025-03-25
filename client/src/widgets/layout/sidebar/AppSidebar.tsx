import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/shared/ui/sidebar";
import { ChatRoomList } from "@/widgets/layout/sidebar/ui";
import { SidebarActionButton } from "@/shared/components";

const AppSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarActionButton />
      </SidebarHeader>
      <SidebarContent>
        <ChatRoomList />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
};

export default AppSidebar;
