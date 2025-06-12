import { Dispatch, SetStateAction } from "react";
import { useLocation } from "react-router-dom";
import { Separator } from "@/shared/ui/separator";
import { DropdownMenuContent } from "@/shared/ui/dropdown-menu";
import { ChatRoomItemArchiveButton, ChatRoomItemDeleteButton, ChatRoomItemRenameButton } from "./menu-buttons";

interface ChatRoomItemMenuPropsType {
  roomId: string;
  roomTitle: string;
  setHoveredRoom: Dispatch<SetStateAction<string | null>>;
}

const ChatRoomItemMenu = ({ roomId, roomTitle, setHoveredRoom }: ChatRoomItemMenuPropsType) => {
  const { pathname } = useLocation();

  const isNowChatRoom = pathname === "/chat/" + roomId;

  return (
    <>
      <DropdownMenuContent
        className="border-border bg-background mt-[-5px] min-w-[8rem] space-y-2 border px-2 py-2"
        align="start"
        sideOffset={-5}
        alignOffset={10}
      >
        <ChatRoomItemRenameButton roomId={roomId} roomTitle={roomTitle} setHoveredRoom={setHoveredRoom} />
        <ChatRoomItemArchiveButton roomId={roomId} isNowChatRoom={isNowChatRoom} />

        <Separator />
        <ChatRoomItemDeleteButton roomId={roomId} isNowChatRoom={isNowChatRoom} />
      </DropdownMenuContent>
    </>
  );
};

export default ChatRoomItemMenu;
