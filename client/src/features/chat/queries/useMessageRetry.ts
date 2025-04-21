import { queryKeys, useCustomMutation } from "@/shared/api";
import { ChatRetryRequestSchema, ChatRetryRequestType } from "@/shared/types/chatMessageType";

const useMessageRetry = (roomId: string) => {
  return useCustomMutation<undefined, ChatRetryRequestType>({
    endpoint: `/chat/retry`,
    method: "POST",
    requestSchema: ChatRetryRequestSchema,
    queryKeyToInvalidate: queryKeys.chats.messages(roomId),
  });
};

export default useMessageRetry;
