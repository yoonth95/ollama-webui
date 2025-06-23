import { create } from "zustand";
import { ChatRoomType } from "@/shared/types/chatRoomType";

type useChatRoomStoreType = {
  chatRooms: ChatRoomType[];
  setChatRooms: (rooms: ChatRoomType[]) => void;
  addChatRooms: (rooms: ChatRoomType[]) => void;
  addChatRoom: (room: ChatRoomType) => void;
  updateChatRoomTitle: (roomId: string, newTitle: string) => void;
  updateChatRoomArchive: (roomId: string, isArchived: boolean) => void;
  updateAllChatRoomArchive: (isArchived: boolean) => void;
  deleteChatRoom: (roomId: string) => void;
  deleteAllChatRooms: () => void;
  syncChatRooms: (rooms: ChatRoomType[]) => void;
};

// 채팅방 관리 스토어 생성
const useChatRoomStore = create<useChatRoomStoreType>((set) => ({
  chatRooms: [],

  // 채팅방 리스트 설정
  setChatRooms: (rooms) => set({ chatRooms: rooms }),

  // 새로운 채팅방 추가 (무한 스크롤링에서 다음 페이지 로드 시)
  addChatRooms: (rooms) => {
    set((state) => {
      const newRooms = rooms.filter(
        (newRoom) => !state.chatRooms.some((existingRoom) => existingRoom.id === newRoom.id),
      );

      return { chatRooms: [...state.chatRooms, ...newRooms] };
    });
  },

  // 단일 채팅방 추가
  addChatRoom: (room) => {
    set((state) => {
      const exists = state.chatRooms.some((existingRoom) => existingRoom.id === room.id);
      if (exists) return state;

      const newList = [...state.chatRooms, room];
      const sortedList = newList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return { chatRooms: sortedList };
    });
  },

  // 채팅방 제목 업데이트
  updateChatRoomTitle: (roomId, newTitle) => {
    set((state) => {
      const updatedRooms = state.chatRooms.map((room) => (room.id === roomId ? { ...room, title: newTitle } : room));

      return { chatRooms: updatedRooms };
    });
  },

  // 채팅방 보관 여부 업데이트
  updateChatRoomArchive: (roomId, isArchived) => {
    set((state) => {
      const updatedRooms = state.chatRooms.map((room) => (room.id === roomId ? { ...room, isArchived } : room));
      return { chatRooms: updatedRooms };
    });
  },

  // 모든 채팅방 보관 여부 업데이트
  updateAllChatRoomArchive: (isArchived) => {
    set((state) => {
      const updatedRooms = state.chatRooms.map((room) => ({ ...room, isArchived }));
      return { chatRooms: updatedRooms };
    });
  },

  // 채팅방 삭제
  deleteChatRoom: (roomId) => {
    set((state) => ({
      chatRooms: state.chatRooms.filter((room) => room.id !== roomId),
    }));
  },

  // 모든 채팅방 삭제
  deleteAllChatRooms: () => {
    set({ chatRooms: [] });
  },

  // 서버 데이터와 스토어 동기화 (차이점만 반영)
  syncChatRooms: (rooms) => {
    set((state) => {
      if (rooms.length === 0) return state;

      let hasChanges = false;
      const roomMap: Record<string, ChatRoomType> = {};
      state.chatRooms.forEach((room) => {
        roomMap[room.id] = room;
      });

      rooms.forEach((room) => {
        const existing = roomMap[room.id];
        if (!existing) {
          hasChanges = true;
          roomMap[room.id] = room;
        } else if (existing.isArchived !== room.isArchived || existing.title !== room.title) {
          hasChanges = true;
          roomMap[room.id] = { ...existing, ...room };
        }
      });

      if (!hasChanges) return state;

      const newRooms = Object.values(roomMap).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      return { chatRooms: newRooms };
    });
  },
}));

export default useChatRoomStore;
