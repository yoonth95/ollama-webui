import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { AlertTriangle, RefreshCw, MessageSquare } from "lucide-react";
import useMessageRetry from "@/features/chat/queries/useMessageRtry";

interface BotChatErrorProps {
  chatRoomId: string;
  errorType?: "network" | "timeout" | "model" | "content" | "unknown";
}

export default function BotChatError({ chatRoomId, errorType = "unknown" }: BotChatErrorProps) {
  const navigate = useNavigate();
  const retryMutation = useMessageRetry(chatRoomId);

  const errorMessages = {
    network: "네트워크 연결에 문제가 발생했습니다. 인터넷 연결을 확인해 주세요.",
    timeout: "응답 생성 시간이 초과되었습니다. 서버가 혼잡하거나 질문이 너무 복잡할 수 있습니다.",
    model: "AI 모델 로딩 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    content: "요청하신 내용에 대한 응답을 생성할 수 없습니다. 다른 방식으로 질문해 보세요.",
    unknown: "알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
  };

  const errorCodes = {
    network: "ERR_NETWORK_FAILURE",
    timeout: "ERR_RESPONSE_TIMEOUT",
    model: "ERR_MODEL_LOADING",
    content: "ERR_CONTENT_POLICY",
    unknown: "ERR_UNKNOWN",
  };

  const handleRetry = () => {
    retryMutation.mutate({ roomId: chatRoomId });
  };

  const moveToHome = () => {
    navigate("/");
  };

  return (
    <div className="dark:border-destructive [&>svg]:text-destructive relative w-full rounded-lg border border-red-800/50 bg-red-950/30 p-4 text-red-100 [&>svg]:absolute [&>svg]:top-4 [&>svg]:left-4 [&>svg+div]:translate-y-[-3px] [&>svg~*]:pl-7">
      <AlertTriangle className="h-5 w-5 text-red-400" />
      <div className="flex w-full flex-col space-y-4">
        <div>
          <h4 className="flex items-center gap-2 text-red-200">
            응답 오류
            <span className="rounded-full bg-red-900/50 px-2 py-0.5 font-mono text-xs text-red-300">
              {errorCodes[errorType]}
            </span>
          </h4>
          <p className="mt-2 text-red-200/80">{errorMessages[errorType]}</p>
        </div>

        <div className="mt-2 flex flex-wrap justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            className="border-red-800/30 bg-red-950/50 text-red-200 hover:bg-red-900/50 hover:text-red-100"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            다시 시도
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={moveToHome}
            className="border-red-800/30 bg-red-950/50 text-red-200 hover:bg-red-900/50 hover:text-red-100"
          >
            <MessageSquare className="mr-2 h-4 w-4" />새 채팅 시작
          </Button>
        </div>
      </div>
    </div>
  );
}
