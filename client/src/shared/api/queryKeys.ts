export const queryKeys = {
  models: {
    list: () => ["models"], // 모델 목록
  },
  rooms: {
    list: () => ["chatRooms"], // 채팅방 목록
    detail: (roomId: string) => ["chatRooms", roomId], // 특정 채팅방
  },
};
