import { Dispatch, SetStateAction, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { DropdownMenuItem, DropdownMenuContent } from "@/shared/ui/dropdown-menu";
import { deleteChatRoom, updateChatRoomTitle } from "@/widgets/layout/sidebar/apis";
import { ConfirmDialog, EditDialog } from "@/shared/components";
import { Pencil, Trash2 } from "lucide-react";

interface ChatRoomItemMenuProps {
  roomId: string;
  roomTitle: string;
  setRoomTitle: Dispatch<SetStateAction<string>>;
  setHoveredRoom: Dispatch<SetStateAction<string | null>>;
}

const ChatRoomItemMenu = ({ roomId, roomTitle, setRoomTitle, setHoveredRoom }: ChatRoomItemMenuProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const isNowChatRoom = pathname === "/chat/" + roomId;
  const alertMessage = isNowChatRoom ? "현재 채팅방이 삭제되고 메인페이지로 이동합니다." : "해당 채팅방이 삭제됩니다.";

  // 채팅방 삭제
  const handleDelete = async () => {
    const { ok, message } = await deleteChatRoom(roomId);
    if (ok) {
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
      if (isNowChatRoom) navigate("/");
    } else {
      toast.error(message);
    }
    return;
  };

  // 채팅방 이름 변경
  const handleRename = async (newTitle: string) => {
    const oldTitle = roomTitle;

    setRoomTitle(newTitle);
    const { ok, message } = await updateChatRoomTitle(roomId, newTitle);
    if (ok) {
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["chatRooms"] });
    } else {
      setRoomTitle(oldTitle);
      toast.error(message);
    }
    setHoveredRoom(null);
  };

  return (
    <>
      <DropdownMenuContent
        className="mt-[-5px] min-w-[10rem] space-y-2 border border-border bg-accent px-2 py-3"
        align="start"
      >
        <DropdownMenuItem
          className="flex cursor-pointer items-center gap-3 rounded-md p-3 text-sm dark:hover:bg-neutral-700/60"
          onClick={() => setShowEditDialog(true)}
        >
          <Pencil />
          <span>이름 변경</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex cursor-pointer items-center gap-3 rounded-md p-3 text-sm text-red-400 hover:text-red-400 dark:hover:bg-neutral-700/60"
          onClick={() => setShowConfirmDialog(true)}
        >
          <Trash2 />
          <span>삭제</span>
        </DropdownMenuItem>
      </DropdownMenuContent>

      {/* 삭제 Alert */}
      <ConfirmDialog
        title="채팅방을 삭제하시겠습니까?"
        description={alertMessage}
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleDelete}
        confirmText="삭제"
        confirmColor="bg-red-500 hover:bg-red-600 dark:bg-red-500 hover:dark:bg-red-600"
      />

      {/* 이름 변경 Alert */}
      <EditDialog
        title="채팅방 이름 변경"
        open={showEditDialog}
        inputValue={roomTitle}
        onOpenChange={setShowEditDialog}
        onConfirm={handleRename}
      />
    </>
  );
};

export default ChatRoomItemMenu;
