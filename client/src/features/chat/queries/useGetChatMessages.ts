import { z } from "zod";
import { queryKeys, useCustomSuspenseQuery } from "@/shared/api";
import { ChatMessageSchema, ChatMessageType } from "@/shared/types/chatMessageType";
import { DisplayType } from "@/shared/types/apiType";

const ChatMessagesArraySchema = z.array(ChatMessageSchema);

export const useGetChatMessages = (chatRoomId: string) => {
  return useCustomSuspenseQuery<ChatMessageType[]>({
    queryKey: queryKeys.chats.messages(chatRoomId),
    endpoint: `/chat/${chatRoomId}`,
    schema: ChatMessagesArraySchema,
    errorOptions: { type: DisplayType.Display },
  });
};
