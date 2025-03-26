import { useState, useEffect } from "react";
import { useWindowSize } from "react-use";
import { useSidebar } from "@/shared/ui/sidebar";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { useFilteredModels } from "@/widgets/layout/header/hooks";
import { MobileDropdownMenu, DesktopDropdownMenu } from "@/widgets/layout/header/components";

const DownloadableModels = () => {
  const { width } = useWindowSize();
  const [sideOffset, setSideOffset] = useState(0);
  const { open } = useSidebar();
  const isMobile = useIsMobile();
  const filterModels = useFilteredModels();

  useEffect(() => {
    if (open) {
      if (width > 945) setSideOffset(0);
      else if (width > 845) setSideOffset(-100);
      else if (width > 768) setSideOffset(-180);
    } else {
      setSideOffset(0);
    }
  }, [width, open]);

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">설치 가능한 모델</h4>
      <div className="flex flex-col gap-1">
        {Object.entries(filterModels).map(([category, models]) =>
          isMobile ? (
            <MobileDropdownMenu key={category} category={category} models={models} />
          ) : (
            <DesktopDropdownMenu key={category} category={category} models={models} sideOffset={sideOffset} />
          ),
        )}
      </div>
    </div>
  );
};

export default DownloadableModels;
