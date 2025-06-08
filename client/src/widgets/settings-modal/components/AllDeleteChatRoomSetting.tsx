import { useNavigate } from "react-router-dom";
import { SettingAction } from "@/widgets/settings-modal/components";
import useDeleteAllChatRoom from "@/widgets/settings-modal/queries/useDeleteAllChatRoom";
import useChatRoomStore from "@/shared/stores/useChatRoomStore";

const AllDeleteChatRoomSetting = ({ isNowChatRoom }: { isNowChatRoom: boolean }) => {
  const navigate = useNavigate();
  const { mutate: deleteAllChatRoomMutate } = useDeleteAllChatRoom();
  const deleteAllChatRooms = useChatRoomStore((state) => state.deleteAllChatRooms);

  const handleDelete = () => {
    deleteAllChatRoomMutate(
      {},
      {
        onSuccess: () => {
          deleteAllChatRooms();
          if (isNowChatRoom) navigate("/");
        },
      },
    );
  };

  return (
    <SettingAction
      type="delete"
      buttonText="모두 삭제"
      title="모든 채팅방을 삭제하시겠습니까?"
      description={`보관된 채팅방을 포함해 모든 채팅방이 삭제됩니다. 
      계속하시겠습니까?`}
      confirmText="삭제"
      confirmColor="bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600"
      onAction={handleDelete}
    />
  );
};

export default AllDeleteChatRoomSetting;
