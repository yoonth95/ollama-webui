import { useCustomMutation } from "@/shared/api";
import { ChatCancelRequestSchema, ChatCancelRequestType } from "@/features/chat/types/sseChatDataType";

const useChatCancel = (forceCancel: boolean = false) => {
  const endpoint = forceCancel ? `/chat/force-stop` : `/chat/cancel`;

  return useCustomMutation<undefined, ChatCancelRequestType>({
    endpoint,
    method: "POST",
    requestSchema: ChatCancelRequestSchema,
  });
};

export default useChatCancel;
