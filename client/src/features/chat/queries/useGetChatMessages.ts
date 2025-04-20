import { queryKeys, useCustomQuery } from "@/shared/api";
import { ChatMessageArraySchema, ChatMessageType } from "@/shared/types/chatMessageType";

/**
 * 채팅 메시지 히스토리를 가져오는 훅
 * - optimistic 모드일 때는 API 호출을 비활성화하여 불필요한 요청 방지
 * @param chatRoomId 채팅방 ID
 * @returns 채팅 메시지 데이터 및 상태
 */
export const useGetChatMessages = (chatRoomId: string, isOptimistic: boolean) => {
  const result = useCustomQuery<ChatMessageType[]>({
    queryKey: queryKeys.chats.messages(chatRoomId),
    endpoint: `/chat/${chatRoomId}`,
    schema: ChatMessageArraySchema,
    options: {
      staleTime: 0,
      enabled: !!chatRoomId && !isOptimistic,
    },
  });

  const { data: historyMessages } = result;
  const isLastBotMessage =
    historyMessages?.data && historyMessages.data.length > 0
      ? historyMessages.data[historyMessages.data.length - 1].role === "assistant"
      : false;

  return {
    ...result,
    isLastBotMessage,
  };
};
