import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { SidebarTrigger } from "@/shared/ui/sidebar";
import { SquarePen } from "lucide-react";

const SidebarActionButton = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between gap-2">
      <SidebarTrigger className="text-accent-foreground/70 dark:text-ring h-9 w-9 [&>svg]:!h-5 [&>svg]:!w-5" />
      <Button
        variant="ghost"
        size="icon"
        aria-label="new-post"
        className="text-accent-foreground/70 dark:text-ring h-9 w-9"
        onClick={() => navigate("/")}
      >
        <SquarePen className="!h-5 !w-5" />
      </Button>
    </div>
  );
};

export default SidebarActionButton;
