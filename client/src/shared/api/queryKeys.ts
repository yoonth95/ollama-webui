const QUERY_KEY_CONSTANTS = {
  MODELS: "models",
  ROOMS: "chatRooms",
  CHATS: "chatMessages",
  ARCHIVED_ROOMS: "archivedRooms",
} as const;

export const queryKeys = {
  models: {
    list: () => [QUERY_KEY_CONSTANTS.MODELS], // 모델 목록
  },
  rooms: {
    list: () => [QUERY_KEY_CONSTANTS.ROOMS], // 채팅방 목록
    detail: (roomId: string) => [QUERY_KEY_CONSTANTS.ROOMS, roomId], // 특정 채팅방
    archived: () => [QUERY_KEY_CONSTANTS.ARCHIVED_ROOMS], // 보관된 채팅방 목록
  },
  chats: {
    messages: (roomId: string) => [QUERY_KEY_CONSTANTS.CHATS, roomId], // 채팅 내역
  },
};
