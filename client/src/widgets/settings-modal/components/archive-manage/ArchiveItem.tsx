import { Link } from "react-router-dom";
import { ArchiveCancelButton, RoomDeleteButton } from "./index";
import { TableRow, TableCell } from "@/shared/ui/table";
import { useModalStore } from "@/shared/stores/useModalStore";
import { ChatRoomType } from "@/shared/types/chatRoomType";

interface ArchiveItemProps {
  item: ChatRoomType;
}

const ArchiveItem = ({ item }: ArchiveItemProps) => {
  const clear = useModalStore((state) => state.clear);

  return (
    <TableRow className="h-14">
      <TableCell className="w-[60%] max-w-0 overflow-hidden">
        <Link
          to={`/chat/${item.id}`}
          onClick={() => clear()}
          className="text-link block truncate hover:underline"
          title={item.title}
        >
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
