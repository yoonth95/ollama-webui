import { useLocation } from "react-router-dom";
import {
  ThemeSelectSetting,
  AllDeleteChatRoomSetting,
  AllArchiveChatRoomSetting,
  ArchiveChatRoomManage,
} from "@/widgets/settings-modal/components";
import { Separator } from "@/shared/ui/separator";

const SettingContent = () => {
  const { pathname } = useLocation();
  const isNowChatRoom = pathname.includes("/chat/");

  return (
    <div className="flex flex-col gap-2 px-5 py-2 text-sm">
      <div className="flex min-h-[52px] items-center justify-between px-1">
        <span>테마</span>
        <ThemeSelectSetting />
      </div>
      <Separator className="bg-sidebar-ring !h-[0.5px]" />
      <div className="flex min-h-[52px] items-center justify-between px-1">
        <span>보관된 채팅방 확인하기</span>
        <ArchiveChatRoomManage />
      </div>
      <Separator className="bg-sidebar-ring !h-[0.5px]" />
      <div className="flex min-h-[52px] items-center justify-between px-1">
        <span>모든 채팅방 보관하기</span>
        <AllArchiveChatRoomSetting isNowChatRoom={isNowChatRoom} />
      </div>
      <Separator className="bg-sidebar-ring !h-[0.5px]" />
      <div className="flex min-h-[52px] items-center justify-between px-1">
        <span>모든 채팅방 삭제하기</span>
        <AllDeleteChatRoomSetting isNowChatRoom={isNowChatRoom} />
      </div>
    </div>
  );
};

export default SettingContent;
