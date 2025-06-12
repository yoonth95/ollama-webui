import { Link } from "react-router-dom";
import { TableRow, TableCell } from "@/shared/ui/table";
import { ChatRoomType } from "@/shared/types/chatRoomType";
import { ArchiveCancelButton, RoomDeleteButton } from "./index";

interface ArchiveItemProps {
  item: ChatRoomType;
}

const ArchiveItem = ({ item }: ArchiveItemProps) => {
  return (
    <TableRow className="h-14">
      <TableCell className="w-[60%] max-w-0 overflow-hidden">
        <Link to={`/chat/${item.id}`} className="text-link block truncate hover:underline" title={item.title}>
          {item.title}
        </Link>
      </TableCell>
      <TableCell className="w-[32%] max-w-0 truncate overflow-hidden">
        {new Date(item.createdAt).toLocaleDateString()}
      </TableCell>
      <TableCell className="w-[8%]">
        <div className="flex items-center justify-center gap-1">
          <ArchiveCancelButton room={item} />

          <RoomDeleteButton roomId={item.id} />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ArchiveItem;
