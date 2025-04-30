import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { useChatOptimisticStore } from "@/shared/stores/useChatOptimisticStore";
import useMessageRetry from "@/features/chat/queries/useMessageRetry";
import { SSEChatErrorType } from "@/features/chat/types/sseChatDataType";
import { AlertTriangle, RefreshCw, MessageSquare } from "lucide-react";

interface BotMessageErrorPropsType {
  roomId: string;
  userMessageId: string;
  answerId?: string;
  errorType?: SSEChatErrorType;
  errorMessage?: string;
}
const BotMessageError = ({ roomId, userMessageId, answerId, errorType, errorMessage }: BotMessageErrorPropsType) => {
  const navigate = useNavigate();
  const { mutate: retryMessageMutation } = useMessageRetry(roomId);
  const setRetryInfo = useChatOptimisticStore((state) => state.setRetryInfo);

  const handleRetryMessage = () => {
    setRetryInfo(answerId || "", "error");
    retryMessageMutation({
      roomId,
      userMessageId: userMessageId || "",
      answerId: answerId || "",
      isErrorRetry: true,
    });
  };

  return (
    <div className="dark:border-destructive [&>svg]:text-destructive relative w-full rounded-lg border border-red-800/50 bg-red-950/30 p-4 text-red-100 [&>svg]:absolute [&>svg]:top-4 [&>svg]:left-4 [&>svg+div]:translate-y-[-3px] [&>svg~*]:pl-7">
      <AlertTriangle className="h-5 w-5 text-red-400" />
      <div className="flex w-full flex-col space-y-4">
        <div>
          <h4 className="flex items-center gap-2 text-red-200">
            응답 오류
            <span className="rounded-full bg-red-900/50 px-2 py-0.5 font-mono text-xs text-red-300">
              {errorType || "unknown"}
            </span>
          </h4>
          <p className="mt-2 text-red-200/80">
            {errorMessage || "알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."}
          </p>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-red-800/30 bg-red-950/50 text-red-200 hover:bg-red-900/50 hover:text-red-100"
            onClick={handleRetryMessage}
          >
            <RefreshCw className="mr-1 h-4 w-4" />
            재시도
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
            className="border-red-800/30 bg-red-950/50 text-red-200 hover:bg-red-900/50 hover:text-red-100"
          >
            <MessageSquare className="mr-1 h-4 w-4" />새 채팅 시작
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BotMessageError;
