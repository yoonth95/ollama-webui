import { create } from "zustand";
import { ChatRoomType } from "@/shared/types/chatRoomType";

type useChatRoomStoreType = {
  chatRooms: ChatRoomType[];
  setChatRooms: (rooms: ChatRoomType[]) => void;
  addChatRooms: (rooms: ChatRoomType[]) => void;
  addChatRoom: (room: ChatRoomType) => void;
  updateChatRoomTitle: (roomId: string, newTitle: string) => void;
  deleteChatRoom: (roomId: string) => void;
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

      return { chatRooms: [room, ...state.chatRooms] };
    });
  },

  // 채팅방 제목 업데이트
  updateChatRoomTitle: (roomId, newTitle) => {
    set((state) => {
      const updatedRooms = state.chatRooms.map((room) => (room.id === roomId ? { ...room, title: newTitle } : room));

      return { chatRooms: updatedRooms };
    });
  },

  // 채팅방 삭제
  deleteChatRoom: (roomId) => {
    set((state) => ({
      chatRooms: state.chatRooms.filter((room) => room.id !== roomId),
    }));
  },
}));

export default useChatRoomStore;
