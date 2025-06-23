import useUnarchiveChatRoom from "@/widgets/settings-modal/queries/useUnarchiveChatRoom";
import { Button } from "@/shared/ui/button";
import useChatRoomStore from "@/shared/stores/useChatRoomStore";
import { ChatRoomType } from "@/shared/types/chatRoomType";

const ArchivedEditor = ({ room }: { room: ChatRoomType }) => {
  const updateChatRoomArchive = useChatRoomStore((state) => state.updateChatRoomArchive);
  const unarchiveChatRoomMutation = useUnarchiveChatRoom(room.id);

  const handleUnarchive = () => {
    unarchiveChatRoomMutation.mutate(
      { roomId: room.id },
      {
        onSuccess: () => {
          updateChatRoomArchive(room.id, false);
        },
      },
    );
  };

  return (
    <div className="mb-10 flex h-28 flex-col items-center justify-center gap-5">
      <p className="text-muted-foreground text-center text-sm">
        해당 채팅방은 보관되었습니다. 채팅을 진행하려면 먼저 보관을 취소하세요.
      </p>
      <Button variant="outline" disabled={unarchiveChatRoomMutation.isPending} onClick={handleUnarchive}>
        보관 취소
      </Button>
    </div>
  );
};

export default ArchivedEditor;
