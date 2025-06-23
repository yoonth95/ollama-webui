import { useNavigate } from "react-router-dom";
import { SettingAction } from "@/widgets/settings-modal/components";
import useArchiveAllChatRoom from "@/widgets/settings-modal/queries/useArchiveAllChatRoom";
import useChatRoomStore from "@/shared/stores/useChatRoomStore";

const AllArchiveChatRoomSetting = ({ isNowChatRoom }: { isNowChatRoom: boolean }) => {
  const navigate = useNavigate();
  const { mutate: archiveAllChatRoomMutate } = useArchiveAllChatRoom();
  const updateAllChatRoomArchive = useChatRoomStore((state) => state.updateAllChatRoomArchive);

  const handleArchive = () => {
    archiveAllChatRoomMutate(
      {},
      {
        onSuccess: () => {
          updateAllChatRoomArchive(true);
          if (isNowChatRoom) navigate("/");
        },
      },
    );
  };

  return (
    <SettingAction
      type="archive"
      buttonText="모두 보관"
      title="모든 채팅방을 보관하시겠습니까?"
      description="채팅방이 보관함으로 이동됩니다. 계속하시겠습니까?"
      confirmText="보관"
      confirmColor="bg-foreground hover:bg-foreground dark:bg-foreground dark:hover:bg-foreground text-background dark:text-background"
      onAction={handleArchive}
    />
  );
};

export default AllArchiveChatRoomSetting;
