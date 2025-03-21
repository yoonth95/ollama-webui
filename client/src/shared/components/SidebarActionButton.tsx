import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { SidebarTrigger } from "@/shared/ui/sidebar";
import { SquarePen } from "lucide-react";

const SidebarActionButton = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between gap-2">
      <SidebarTrigger className="h-8 w-8 text-ring [&>svg]:!h-5 [&>svg]:!w-5" />
      <Button variant="ghost" size="icon" aria-label="new-post" className="h-8 w-8 text-ring" onClick={() => navigate("/")}>
        <SquarePen className="!h-5 !w-5" />
      </Button>
    </div>
  );
};

export default SidebarActionButton;
