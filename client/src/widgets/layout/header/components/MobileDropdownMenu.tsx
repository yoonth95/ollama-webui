import { ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { CustomScrollbar } from "@/shared/ui/custom-scrollbar";
import { SubMenuItem } from "@/widgets/layout/header/components";
import { ModelInfoType } from "@/shared/types/modelType";

type MobileDropdownMenuProps = {
  category: string;
  models: ModelInfoType[];
};

const MobileDropdownMenu = ({ category, models }: MobileDropdownMenuProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger className="px-4 py-2 flex items-center justify-between w-full">
      <span className="text-sm">{category}</span>
      <ChevronDown className="w-4 h-4" />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="center" className="w-[calc(100vw-2rem)] max-h-[15rem]">
      <CustomScrollbar className="overflow-y-auto">
        {models.map((model) => (
          <SubMenuItem key={model.model} model={model} />
        ))}
      </CustomScrollbar>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default MobileDropdownMenu;
