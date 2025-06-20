import { useShallow } from "zustand/shallow";
import { useNavigate } from "react-router-dom";
import { useDeleteChatRoom } from "@/widgets/layout/sidebar/queries";
import { DropdownMenuItem } from "@/shared/ui/dropdown-menu";
import { ConfirmDialog } from "@/shared/components";
import { useModalStore } from "@/shared/stores/useModalStore";
import useChatRoomStore from "@/shared/stores/useChatRoomStore";
import { Trash2 } from "lucide-react";

interface ChatRoomItemDeleteButtonPropsType {
  roomId: string;
  isNowChatRoom: boolean;
}

const ChatRoomItemDeleteButton = ({ roomId, isNowChatRoom }: ChatRoomItemDeleteButtonPropsType) => {
  const navigate = useNavigate();

  const id = `delete-${roomId}`;
  const { open, closeCurrent, isOpen } = useModalStore(
    useShallow((state) => ({
      open: state.open,
      closeCurrent: state.closeCurrent,
      isOpen: state.isOpen(id),
    })),
  );

  const deleteChatRoom = useChatRoomStore((state) => state.deleteChatRoom);
  const deleteChatRoomMutation = useDeleteChatRoom();

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

  return (
    <>
      <DropdownMenuItem
        className="flex cursor-pointer items-center gap-3 rounded-md p-2 text-sm hover:bg-red-400/10 dark:hover:bg-red-400/10"
        onSelect={(e) => {
          e.preventDefault();
          open({ id, type: "alert" });
        }}
      >
        <Trash2 className="text-red-400" />
        <span className="text-red-400 hover:text-red-400">삭제</span>
      </DropdownMenuItem>

      {/* 삭제 Alert */}
      <ConfirmDialog
        title="채팅방을 삭제하시겠습니까?"
        description={isNowChatRoom ? "현재 채팅방이 삭제되고 메인페이지로 이동합니다." : "해당 채팅방이 삭제됩니다."}
        open={isOpen}
        onOpenChange={(openState) => {
          if (openState) {
            open({ id, type: "alert" });
          } else {
            closeCurrent();
          }
        }}
        onConfirm={handleDelete}
        confirmText="삭제"
        confirmColor="bg-red-500 hover:bg-red-600 dark:bg-red-500 hover:dark:bg-red-600"
      />
    </>
  );
};

export default ChatRoomItemDeleteButton;
