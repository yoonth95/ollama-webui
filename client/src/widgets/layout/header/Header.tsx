import { useEffect } from "react";
import { useSidebar } from "@/shared/ui/sidebar";
import { Button } from "@/shared/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { SidebarActionButton, ThemeToggle } from "@/shared/components";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { useModelSelectStore } from "@/shared/stores/useModelSelectStore";
import { DisplayType } from "@/shared/hooks/useApiError";
import { useGetModels } from "@/widgets/layout/header/hooks";
import { ErrorDisplay, HeaderDropdownMenu } from "@/widgets/layout/header/ui";
import { ChevronDown, LoaderCircle } from "lucide-react";

const Header = () => {
  const { open } = useSidebar();
  const isMobile = useIsMobile();
  const { selectedModel, setSelectedModel } = useModelSelectStore();
  const { models, isLoading, displayError } = useGetModels(DisplayType.Display);

  useEffect(() => {
    if (!isLoading && selectedModel && !models.some((m) => m.model === selectedModel.model)) {
      setSelectedModel(null);
    }
  }, [isLoading, models, selectedModel, setSelectedModel]);

  return (
    <header className="flex justify-between p-2">
      <div className="flex items-center gap-3 h-8">
        {isMobile || !open ? <SidebarActionButton /> : null}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" aria-label="dropdown" className="p-0 text-lg">
              <span className="font-medium">{selectedModel ? selectedModel.model : "모델 선택"}</span>
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-[20rem] min-h-[7.5rem] border p-0" align="start">
            {isLoading ? (
              <div className="flex items-center justify-center h-[7.5rem]">
                <LoaderCircle className="animate-spin" />
              </div>
            ) : (
              <>{displayError ? <ErrorDisplay error={displayError} /> : <HeaderDropdownMenu />}</>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ThemeToggle />
    </header>
  );
};

export default Header;
