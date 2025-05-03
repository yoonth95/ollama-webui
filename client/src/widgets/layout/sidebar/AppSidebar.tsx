import { ErrorBoundary } from "react-error-boundary";
import { ChatRoomList, SidebarError } from "@/widgets/layout/sidebar/components";
import { SidebarActionButton } from "@/shared/components";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/shared/ui/sidebar";

const AppSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarActionButton />
      </SidebarHeader>
      <SidebarContent>
        <ErrorBoundary key={"sidebar"} FallbackComponent={SidebarError}>
          <ChatRoomList />
        </ErrorBoundary>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
};

export default AppSidebar;
