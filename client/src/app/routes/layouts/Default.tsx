import { Outlet } from "react-router-dom";
import { useCookies } from "react-cookie";
import { SidebarProvider } from "@/shared/ui/sidebar";
import AppSidebar from "@/widgets/layout/sidebar/AppSidebar";
import Header from "@/widgets/layout/header/Header";

export default function DefaultLayout() {
  const [cookies] = useCookies(["sidebar"]);
  const defaultOpen = cookies?.sidebar === true;

  return (
    <div className="flex h-screen bg-background">
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex flex-1 flex-col items-center justify-center overflow-hidden">
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
