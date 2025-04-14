import { z } from "zod";
import { queryKeys, useCustomMutation } from "@/shared/api";

const MessageRetryRequestSchema = z.object({
  roomId: z.string(),
});
type MessageRetryRequestType = z.infer<typeof MessageRetryRequestSchema>;

const useMessageRetry = (roomId: string) => {
  return useCustomMutation<undefined, MessageRetryRequestType>({
    endpoint: `/chat/retry`,
    method: "POST",
    requestSchema: MessageRetryRequestSchema,
    queryKeyToInvalidate: queryKeys.chats.messages(roomId),
  });
};

export default useMessageRetry;
