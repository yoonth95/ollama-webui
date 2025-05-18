import SettingAction from "./SettingAction";

const AllDeleteChatRoomSetting = () => {
  const handleDelete = () => {
    // 여기에 삭제 로직 구현
    console.log("모든 채팅방을 삭제했습니다.");
  };

  return (
    <SettingAction
      type="delete"
      buttonText="모두 삭제"
      title="모든 채팅방을 삭제하시겠습니까?"
      description="모든 채팅방이 삭제됩니다. 계속하시겠습니까?"
      confirmText="삭제"
      confirmColor="bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600"
      onAction={handleDelete}
    />
  );
};

export default AllDeleteChatRoomSetting;
