import { ChatRoomList } from "@/widgets/layout/sidebar/components";
import { SidebarActionButton } from "@/shared/components";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/shared/ui/sidebar";

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
