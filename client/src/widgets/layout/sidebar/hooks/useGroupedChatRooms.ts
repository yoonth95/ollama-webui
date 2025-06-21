import { useMemo } from "react";
import { subDays, isToday, isYesterday, isAfter, parseISO } from "date-fns";
import { ChatRoomType, GroupChatRoomType } from "@/shared/types/chatRoomType";

const useGroupedChatRooms = (chatRooms: ChatRoomType[]) => {
  return useMemo(() => {
    const today: ChatRoomType[] = [];
    const yesterday: ChatRoomType[] = [];
    const lastWeek: ChatRoomType[] = [];
    const older: ChatRoomType[] = [];
    const sevenDaysAgo = subDays(new Date(), 7);

    chatRooms.forEach((chat: ChatRoomType) => {
      const chatDate = parseISO(chat.createdAt);
      if (isToday(chatDate)) today.push(chat);
      else if (isYesterday(chatDate)) yesterday.push(chat);
      else if (isAfter(chatDate, sevenDaysAgo)) lastWeek.push(chat);
      else older.push(chat);
    });

    return [
      { category: "오늘", items: today },
      { category: "어제", items: yesterday },
      { category: "지난 7일", items: lastWeek },
      { category: "지난 30일", items: older },
    ].filter((group) => group.items.length > 0); // 빈 그룹 제거
  }, [chatRooms]) as GroupChatRoomType[];
};

export default useGroupedChatRooms;
