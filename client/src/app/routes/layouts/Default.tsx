import { useCallback } from "react";
import { Outlet } from "react-router-dom";
import { useCookies } from "react-cookie";
import { MainDropzone } from "@/features/dropzone/MainDropzone";
import AppSidebar from "@/widgets/layout/sidebar/AppSidebar";
import Header from "@/widgets/layout/header/Header";
import { SidebarProvider } from "@/shared/ui/sidebar";
import { useLocationChange } from "@/shared/hooks/useLocationChange";
import { useChatOptimisticStore } from "@/shared/stores/useChatOptimisticStore";

export default function DefaultLayout() {
  const [cookies] = useCookies(["sidebar"]);
  const defaultOpen = cookies?.sidebar !== false;
  const deactivateOptimisticUI = useChatOptimisticStore((state) => state.deactivateOptimisticUI);

  // 경로 변경 감지 콜백
  const handleRouteChange = useCallback(
    (currentPath: string) => {
      // 홈 페이지로 이동 시 Optimistic UI 상태 초기화
      if (currentPath === "/") deactivateOptimisticUI();
    },
    [deactivateOptimisticUI],
  );

  // 경로 변경 감지
  useLocationChange(handleRouteChange);

  return (
    <div className="bg-background flex h-screen overflow-hidden">
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
