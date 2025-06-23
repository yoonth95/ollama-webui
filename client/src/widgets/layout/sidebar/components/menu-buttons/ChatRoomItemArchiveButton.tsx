import { useNavigate } from "react-router-dom";
import useArchiveChatRoom from "@/widgets/layout/sidebar/queries/useArchiveChatRoom";
import { DropdownMenuItem } from "@/shared/ui/dropdown-menu";
import useChatRoomStore from "@/shared/stores/useChatRoomStore";
import { Archive } from "lucide-react";

interface ChatRoomItemArchiveButtonPropsType {
  roomId: string;
  isNowChatRoom: boolean;
}

const ChatRoomItemArchiveButton = ({ roomId, isNowChatRoom }: ChatRoomItemArchiveButtonPropsType) => {
  const navigate = useNavigate();
  const updateChatRoomArchive = useChatRoomStore((state) => state.updateChatRoomArchive);
  const archiveChatRoomMutation = useArchiveChatRoom();

  const handleArchive = () => {
    archiveChatRoomMutation.mutate(
      { roomId },
      {
        onSuccess: () => {
          updateChatRoomArchive(roomId, true);
          if (isNowChatRoom) navigate("/");
        },
      },
    );
  };

  return (
    <DropdownMenuItem
      className="dark:hover:bg-accent hover:bg-accent flex cursor-pointer items-center gap-3 rounded-md p-2 text-sm"
      onClick={handleArchive}
    >
      <Archive />
      <span>채팅방 보관</span>
    </DropdownMenuItem>
  );
};

export default ChatRoomItemArchiveButton;
