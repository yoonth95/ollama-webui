import { DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@/shared/ui/dropdown-menu";
import { CustomScrollbar } from "@/shared/ui/custom-scrollbar";
import { SubMenuItem } from "@/widgets/layout/header/components";
import { ModelInfoType } from "@/shared/types/modelType";

type DesktopDropdownMenuProps = {
  category: string;
  models: ModelInfoType[];
  sideOffset: number;
};

const DesktopDropdownMenu = ({ category, models, sideOffset }: DesktopDropdownMenuProps) => (
  <DropdownMenuSub>
    <DropdownMenuSubTrigger className="px-4 py-2">
      <span>{category}</span>
    </DropdownMenuSubTrigger>
    <DropdownMenuSubContent className="p-2" sideOffset={sideOffset} alignOffset={20}>
      <CustomScrollbar className="max-h-[15rem] overflow-y-auto" width="22rem">
        {models.map((model) => (
          <SubMenuItem key={model.model} model={model} />
        ))}
      </CustomScrollbar>
    </DropdownMenuSubContent>
  </DropdownMenuSub>
);

export default DesktopDropdownMenu;
