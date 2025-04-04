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
            <Header />
            <main className="relative mx-2 flex flex-1 flex-col items-center justify-center overflow-hidden sm:mx-5">
              <Outlet />
            </main>
          </MainDropzone>
        </div>
      </SidebarProvider>
    </div>
  );
}
