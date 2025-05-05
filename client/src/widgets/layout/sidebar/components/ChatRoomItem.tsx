import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChatRoomItemMenu } from "@/widgets/layout/sidebar/components";
import { Button } from "@/shared/ui/button";
import { DropdownMenu, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import useChatRoomStore from "@/shared/stores/useChatRoomStore";
import { ChatRoomType } from "@/shared/types/chatRoomType";
import { cn } from "@/shared/lib/utils";
import { MoreHorizontal } from "lucide-react";

interface ChatRoomItemPropsType {
  chat: Pick<ChatRoomType, "id" | "title">;
}
const ChatRoomItem = ({ chat }: ChatRoomItemPropsType) => {
  const { pathname } = useLocation();
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [openedRoom, setOpenedRoom] = useState<string | null>(null);
  const chatRooms = useChatRoomStore((state) => state.chatRooms);

  const currentChatRoom = chatRooms.find((room) => room.id === chat.id) || chat;
  const isEnterRoom = chat.id && pathname.includes(chat.id);
  const isActive = openedRoom === chat.id || (hoveredRoom === chat.id && !openedRoom) || isEnterRoom;

  return (
    <li
      key={chat.id}
      className={cn(
        `group/menu-item relative flex w-full justify-between rounded-md transition-colors ${
          isActive ? "bg-accent" : ""
        }`,
        "dark:hover:bg-accent",
      )}
    >
      <Link to={"/chat/" + chat.id} className={cn(`block w-full flex-1 cursor-pointer rounded-md p-2 text-sm`)}>
        <span className="block w-[85%] truncate">{currentChatRoom.title}</span>
      </Link>

      <DropdownMenu
        onOpenChange={(open) => {
          if (open) {
            setOpenedRoom(chat.id);
          } else {
            setOpenedRoom(null);
            setHoveredRoom(null);
          }
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            aria-label="sub-menu-button"
            className={cn(
              `absolute top-1/2 right-2 -translate-y-1/2 transform p-2 opacity-0 transition-opacity group-hover/menu-item:opacity-100 dark:hover:bg-transparent ${
                isActive ? "opacity-100" : ""
              }`,
            )}
          >
            <MoreHorizontal size={18} />
          </Button>
        </DropdownMenuTrigger>

        <ChatRoomItemMenu roomId={chat.id} roomTitle={currentChatRoom.title} setHoveredRoom={setHoveredRoom} />
      </DropdownMenu>
    </li>
  );
};

export default ChatRoomItem;
