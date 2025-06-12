import { useQueryClient } from "@tanstack/react-query";
import useUnarchiveChatRoom from "@/widgets/settings-modal/queries/useUnarchiveChatRoom";
import { queryKeys } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import TooltipContainer from "@/shared/components/TooltipContainer";
import useChatRoomStore from "@/shared/stores/useChatRoomStore";
import { removeItemFromInfiniteCache } from "@/shared/utils/reactQueryCacheUtils";
import { ChatRoomType } from "@/shared/types/chatRoomType";
import { ArchiveX } from "lucide-react";

const ArchiveCancelButton = ({ room }: { room: ChatRoomType }) => {
  const queryClient = useQueryClient();
  const addChatRoom = useChatRoomStore((state) => state.addChatRoom);
  const unArchiveChatRoomMutation = useUnarchiveChatRoom();

  const handleDelete = () => {
    unArchiveChatRoomMutation.mutate(
      { roomId: room.id },
      {
        onSuccess: () => {
          // 사이드바 스토어에 채팅방 추가
          addChatRoom({
            id: room.id,
            title: room.title,
            isArchived: false,
            createdAt: room.createdAt,
            updatedAt: room.updatedAt,
          });
          removeItemFromInfiniteCache<ChatRoomType>(queryClient, queryKeys.rooms.archived(), room.id);
        },
      },
    );
  };

  return (
    <TooltipContainer message="보관 취소" side="top">
      <Button
        variant="ghost"
        aria-label="delete-model"
        className="h-4 w-4 rounded p-0 opacity-70 transition-opacity hover:opacity-100"
        onClick={handleDelete}
      >
        <ArchiveX />
      </Button>
    </TooltipContainer>
  );
};

export default ArchiveCancelButton;
