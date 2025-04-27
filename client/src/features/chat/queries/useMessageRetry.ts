import { queryKeys, useCustomMutation } from "@/shared/api";
import { useSSEEventSourceStore } from "@/shared/stores/useSSEEventSourceStore";
import { useChatOptimisticStore } from "@/shared/stores/useChatOptimisticStore";
import { ChatRetryRequestSchema, ChatRetryRequestType } from "@/shared/types/chatMessageType";

const useMessageRetry = (roomId: string) => {
  const setIsStartSSE = useSSEEventSourceStore((state) => state.setIsStartSSE);
  const setIsRetryLoading = useChatOptimisticStore((state) => state.setIsRetryLoading);

  return useCustomMutation<undefined, ChatRetryRequestType>({
    endpoint: `/chat/retry`,
    method: "POST",
    requestSchema: ChatRetryRequestSchema,
    queryKeyToInvalidate: queryKeys.chats.messages(roomId),
    options: {
      onSuccess: () => {
        setIsRetryLoading(true);
      },
      onError: () => {
        setIsStartSSE(false);
        setIsRetryLoading(false);
      },
    },
  });
};

export default useMessageRetry;
