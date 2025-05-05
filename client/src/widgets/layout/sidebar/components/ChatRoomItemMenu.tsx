import { Dispatch, SetStateAction, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useShallow } from "zustand/shallow";
import { useDeleteChatRoom, useUpdateChatRoomTitle } from "@/widgets/layout/sidebar/queries";
import { Separator } from "@/shared/ui/separator";
import { DropdownMenuItem, DropdownMenuContent } from "@/shared/ui/dropdown-menu";
import { ConfirmDialog, EditDialog } from "@/shared/components";
import useChatRoomStore from "@/shared/stores/useChatRoomStore";
import { Pencil, Trash2 } from "lucide-react";

interface ChatRoomItemMenuPropsType {
  roomId: string;
  roomTitle: string;
  setHoveredRoom: Dispatch<SetStateAction<string | null>>;
}
const ChatRoomItemMenu = ({ roomId, roomTitle, setHoveredRoom }: ChatRoomItemMenuPropsType) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const [updateChatRoomTitle, deleteChatRoom] = useChatRoomStore(
    useShallow((state) => [state.updateChatRoomTitle, state.deleteChatRoom]),
  );

  const updateChatRoomTitleMutation = useUpdateChatRoomTitle();
  const deleteChatRoomMutation = useDeleteChatRoom();

  const isNowChatRoom = pathname === "/chat/" + roomId;
  const alertMessage = isNowChatRoom ? "현재 채팅방이 삭제되고 메인페이지로 이동합니다." : "해당 채팅방이 삭제됩니다.";

  // 채팅방 삭제
  const handleDelete = () => {
    deleteChatRoomMutation.mutate(
      { params: { roomId } },
      {
        onSuccess: () => {
          deleteChatRoom(roomId);
          if (isNowChatRoom) navigate("/");
        },
      },
    );
  };

  // 채팅방 이름 변경
  const handleRename = (newTitle: string) => {
    updateChatRoomTitleMutation.mutate(
      { roomId, newTitle },
      {
        onSuccess: () => {
          updateChatRoomTitle(roomId, newTitle);
        },
      },
    );
    setHoveredRoom(null);
  };

  return (
    <>
      <DropdownMenuContent
        className="border-border bg-background mt-[-5px] min-w-[8rem] space-y-2 border px-2 py-2"
        align="start"
        sideOffset={-5}
        alignOffset={10}
      >
        <DropdownMenuItem
          className="dark:hover:bg-accent flex cursor-pointer items-center gap-3 rounded-md p-2 text-sm"
          onClick={() => setShowEditDialog(true)}
        >
          <Pencil />
          <span>이름 변경</span>
        </DropdownMenuItem>
        <Separator />
        <DropdownMenuItem
          className="dark:hover:bg-accent flex cursor-pointer items-center gap-3 rounded-md p-2 text-sm text-red-400 hover:text-red-400"
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
