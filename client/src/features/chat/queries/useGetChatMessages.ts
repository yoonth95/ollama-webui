import { queryKeys, useCustomSuspenseQuery } from "@/shared/api";
import { ChatMessageArraySchema, ChatMessageType } from "@/shared/types/chatMessageType";
import { DisplayType } from "@/shared/types/apiType";

export const useGetChatMessages = (chatRoomId: string) => {
  return useCustomSuspenseQuery<ChatMessageType[]>({
    queryKey: queryKeys.chats.messages(chatRoomId),
    endpoint: `/chat/${chatRoomId}`,
    schema: ChatMessageArraySchema,
    errorOptions: { type: DisplayType.Display },
  });
};
