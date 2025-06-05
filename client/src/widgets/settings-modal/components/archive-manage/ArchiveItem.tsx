import { Link } from "react-router-dom";
import TooltipContainer from "@/shared/components/TooltipContainer";
import { TableRow, TableCell } from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import { Trash2, ArchiveRestore } from "lucide-react";

const ArchiveItem = () => {
  return (
    <TableRow className="h-12">
      <TableCell>
        <Link to="/chat/INV001" className="text-link hover:underline">
          INV001
        </Link>
      </TableCell>
      <TableCell>2025-06-05</TableCell>
      <TableCell>
        <div className="flex items-center justify-center gap-1">
          <TooltipContainer message="보관 취소" side="top">
            <Button
              variant="ghost"
              aria-label="delete-model"
              className="h-4 w-4 rounded p-0 opacity-70 transition-opacity hover:opacity-100"
            >
              <ArchiveRestore />
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
