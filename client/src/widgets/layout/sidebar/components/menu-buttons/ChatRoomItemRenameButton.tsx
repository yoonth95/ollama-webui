import { Dispatch, SetStateAction, useState } from "react";
import { useUpdateChatRoomTitle } from "@/widgets/layout/sidebar/queries";
import { DropdownMenuItem } from "@/shared/ui/dropdown-menu";
import { EditDialog } from "@/shared/components";
import useChatRoomStore from "@/shared/stores/useChatRoomStore";
import { Pencil } from "lucide-react";

interface ChatRoomItemRenameButtonPropsType {
  roomId: string;
  roomTitle: string;
  setHoveredRoom: Dispatch<SetStateAction<string | null>>;
}

const ChatRoomItemRenameButton = ({ roomId, roomTitle, setHoveredRoom }: ChatRoomItemRenameButtonPropsType) => {
  const [showEditDialog, setShowEditDialog] = useState(false);

  const updateChatRoomTitle = useChatRoomStore((state) => state.updateChatRoomTitle);
  const updateChatRoomTitleMutation = useUpdateChatRoomTitle();

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
      <DropdownMenuItem
        className="dark:hover:bg-accent hover:bg-accent flex cursor-pointer items-center gap-3 rounded-md p-2 text-sm"
        onSelect={(e) => {
          e.preventDefault();
          setShowEditDialog(true);
        }}
      >
        <Pencil />
        <span>이름 변경</span>
      </DropdownMenuItem>

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

export default ChatRoomItemRenameButton;
