import { SettingAction } from "@/widgets/settings-modal/components";

const ArchiveChatRoomManage = () => {
  const handleManage = () => {
    // 여기에 관리 로직 구현
    console.log("채팅방 관리를 시작합니다.");
  };

  return (
    <SettingAction
      type="manage"
      buttonText="관리"
      title="모든 채팅방을 보관하시겠습니까?"
      description="채팅방이 보관함으로 이동됩니다. 계속하시겠습니까?"
      confirmText="보관"
      confirmColor="bg-foreground hover:bg-foreground dark:bg-foreground dark:hover:bg-foreground text-background dark:text-background"
      onAction={handleManage}
    />
  );
};

export default ArchiveChatRoomManage;
