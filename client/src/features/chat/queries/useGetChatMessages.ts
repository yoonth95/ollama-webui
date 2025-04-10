import { queryKeys, useCustomQuery } from "@/shared/api";
import { ChatMessageArraySchema, ChatMessageType } from "@/shared/types/chatMessageType";
import { DisplayType } from "@/shared/types/apiType";

export const useGetChatMessages = (chatRoomId: string) => {
  return useCustomQuery<ChatMessageType[]>({
    queryKey: queryKeys.chats.messages(chatRoomId),
    endpoint: `/chat/${chatRoomId}`,
    schema: ChatMessageArraySchema,
    errorOptions: { type: DisplayType.Display },
  });
};
