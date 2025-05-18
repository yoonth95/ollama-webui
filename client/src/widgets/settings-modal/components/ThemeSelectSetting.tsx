import { useTheme } from "@/app/providers/ThemeProvider";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItemCheck,
} from "@/shared/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

type Theme = "dark" | "light" | "system";

const ThemeSelectSetting = () => {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-auto items-center justify-end gap-2 px-3 py-1.5">
          <span>
            {theme === "system" && "시스템"}
            {theme === "dark" && "다크 모드"}
            {theme === "light" && "라이트 모드"}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="p-3 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        align="end"
      >
        <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as Theme)}>
          <DropdownMenuRadioItemCheck
            value="system"
            className="focus:bg-accent dark:focus:bg-neutral-700 dark:focus:text-neutral-100"
          >
            시스템
          </DropdownMenuRadioItemCheck>
          <DropdownMenuRadioItemCheck
            value="dark"
            className="focus:bg-accent dark:focus:bg-neutral-700 dark:focus:text-neutral-100"
          >
            다크 모드
          </DropdownMenuRadioItemCheck>
          <DropdownMenuRadioItemCheck
            value="light"
            className="focus:bg-accent dark:focus:bg-neutral-700 dark:focus:text-neutral-100"
          >
            라이트 모드
          </DropdownMenuRadioItemCheck>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelectSetting;
