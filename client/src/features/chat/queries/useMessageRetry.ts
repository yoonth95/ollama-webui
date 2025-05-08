import { queryKeys, useCustomMutation } from "@/shared/api";
import { useSSEEventSourceStore } from "@/shared/stores/useSSEEventSourceStore";
import { useChatOptimisticStore } from "@/shared/stores/useChatOptimisticStore";
import { ChatRetryRequestSchema, ChatRetryRequestType } from "@/shared/types/chatMessageType";

const useMessageRetry = (roomId: string) => {
  const setIsStartSSE = useSSEEventSourceStore((state) => state.setIsStartSSE);
  const clearRetryInfo = useChatOptimisticStore((state) => state.clearRetryInfo);

  return useCustomMutation<undefined, ChatRetryRequestType>({
    endpoint: `/chat/retry`,
    method: "POST",
    requestSchema: ChatRetryRequestSchema,
    queryKeyToInvalidate: queryKeys.chats.messages(roomId),
    options: {
      onError: () => {
        setIsStartSSE("chat", false);
        clearRetryInfo();
      },
    },
  });
};

export default useMessageRetry;
