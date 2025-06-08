import { Link } from "react-router-dom";
import TooltipContainer from "@/shared/components/TooltipContainer";
import { Button } from "@/shared/ui/button";
import { TableRow, TableCell } from "@/shared/ui/table";
import { Trash2, ArchiveX } from "lucide-react";

const ArchiveItem = () => {
  return (
    <TableRow className="h-14">
      <TableCell className="w-[60%] max-w-0 overflow-hidden">
        <Link
          to="/chat/INV001"
          className="text-link block truncate hover:underline"
          title="INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001"
        >
          INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001INV001
        </Link>
      </TableCell>
      <TableCell className="w-[32%] max-w-0 truncate overflow-hidden">2025-06-05</TableCell>
      <TableCell className="w-[8%]">
        <div className="flex items-center justify-center gap-1">
          <TooltipContainer message="보관 취소" side="top">
            <Button
              variant="ghost"
              aria-label="delete-model"
              className="h-4 w-4 rounded p-0 opacity-70 transition-opacity hover:opacity-100"
            >
              <ArchiveX />
            </Button>
          </TooltipContainer>

          <TooltipContainer message="채팅방 삭제" side="top">
            <Button
              variant="ghost"
              aria-label="delete-model"
              className="h-4 w-4 rounded p-0 opacity-70 transition-opacity hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipContainer>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ArchiveItem;
