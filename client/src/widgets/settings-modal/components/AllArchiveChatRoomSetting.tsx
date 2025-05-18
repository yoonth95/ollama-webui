import SettingAction from "./SettingAction";

const AllArchiveChatRoomSetting = () => {
  const handleArchive = () => {
    // 여기에 보관 로직 구현
    console.log("모든 채팅방을 보관했습니다.");
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
