import { Outlet } from "react-router-dom";
import { useCookies } from "react-cookie";
import { SidebarProvider } from "@/shared/ui/sidebar";
import AppSidebar from "@/widgets/layout/sidebar/AppSidebar";
import Header from "@/widgets/layout/header/Header";
import { MainDropzone } from "@/features/dropzone/MainDropzone";

export default function DefaultLayout() {
  const [cookies] = useCookies(["sidebar"]);
  const defaultOpen = cookies?.sidebar === true;

  return (
    <div className="bg-background flex h-screen">
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <MainDropzone>
            <div className="bg-background sticky top-0 z-10">
              <Header />
            </div>
            <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden">
              <Outlet />
            </main>
          </MainDropzone>
        </div>
      </SidebarProvider>
    </div>
  );
}
