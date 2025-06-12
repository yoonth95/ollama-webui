import { useQueryClient } from "@tanstack/react-query";
import useDeleteChatRoom from "@/widgets/layout/sidebar/queries/useDeleteChatRoom";
import TooltipContainer from "@/shared/components/TooltipContainer";
import { Button } from "@/shared/ui/button";
import { ChatRoomType } from "@/shared/types/chatRoomType";
import { removeItemFromInfiniteCache } from "@/shared/utils/reactQueryCacheUtils";
import { queryKeys } from "@/shared/api";
import { Trash2 } from "lucide-react";

interface RoomDeleteButtonPropsType {
  roomId: string;
}

const RoomDeleteButton = ({ roomId }: RoomDeleteButtonPropsType) => {
  const queryClient = useQueryClient();
  const mutation = useDeleteChatRoom();

  const handleDelete = () => {
    mutation.mutate(
      { params: { roomId } },
      {
        onSuccess: () => {
          removeItemFromInfiniteCache<ChatRoomType>(queryClient, queryKeys.rooms.archived(), roomId);
        },
      },
    );
  };

  return (
    <TooltipContainer message="채팅방 삭제" side="top">
      <Button
        variant="ghost"
        aria-label="delete-model"
        className="h-4 w-4 rounded p-0 opacity-70 transition-opacity hover:opacity-100"
        onClick={handleDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </TooltipContainer>
  );
};

export default RoomDeleteButton;
