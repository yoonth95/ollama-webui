import { useEffect } from "react";
import { useSidebar } from "@/shared/ui/sidebar";
import { Button } from "@/shared/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { SidebarActionButton, ThemeToggle } from "@/shared/components";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { useModelSelectStore } from "@/shared/stores/useModelSelectStore";
import { cn } from "@/shared/lib/utils";
import { useGetModels } from "@/widgets/layout/header/queries";
import { ErrorDisplay, HeaderDropdownMenu } from "@/widgets/layout/header/components";
import { DisplayType } from "@/shared/types/apiType";
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
      <div className="flex h-8 w-full items-center gap-3">
        {isMobile || !open ? <SidebarActionButton /> : null}
        <DropdownMenu>
          <div className={cn("flex flex-1 items-center", isMobile && "justify-center")}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" aria-label="dropdown" className="p-0 text-lg">
                <span className="text-accent-foreground-70 font-bold">
                  {selectedModel ? selectedModel.model : "모델 선택"}
                </span>
                <ChevronDown className="text-accent-foreground-70" />
              </Button>
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent
            className={cn(
              "min-h-[7.5rem] min-w-[20rem] p-0",
              isMobile && "fixed top-2 left-[-24px] w-[calc(100vw-1rem)] -translate-x-1/2 transform",
            )}
            sideOffset={0}
            alignOffset={0}
            align={isMobile ? "center" : "start"}
          >
            {isLoading ? (
              <div className="flex h-[7.5rem] items-center justify-center">
                <LoaderCircle className="animate-spin" />
              </div>
            ) : (
              <>
                {displayError ? (
                  <ErrorDisplay error={displayError} />
                ) : (
                  <div className={cn("flex flex-col gap-2", !isMobile && "max-w-[30rem]")}>
                    <HeaderDropdownMenu />
                  </div>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
