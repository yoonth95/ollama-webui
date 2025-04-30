import useMessageRetry from "@/features/chat/queries/useMessageRetry";
import { useChatOptimisticStore } from "@/shared/stores/useChatOptimisticStore";
import { Button } from "@/shared/ui/button";
import { AlertTriangle } from "lucide-react";

const BotMessageEmpty = ({ roomId }: { roomId: string }) => {
  const { mutate: retryMessageMutation } = useMessageRetry(roomId);
  const setRetryInfo = useChatOptimisticStore((state) => state.setRetryInfo);

  const handleRetryMessage = () => {
    setRetryInfo(null, "empty");
    retryMessageMutation({
      roomId,
      userMessageId: "",
      answerId: "",
      isErrorRetry: false,
    });
  };

  return (
    <div className="py-5">
      <div className="w-full">
        <div className="bg-card border-input-border flex w-full flex-col gap-3 rounded-2xl border p-4 shadow-sm sm:w-[30rem]">
          <div className="flex flex-wrap items-center gap-4">
            <AlertTriangle className="h-5 w-5" />
            <div className="flex max-w-96 flex-1 flex-col gap-1">
              <p className="text-primary text-sm">마지막 질문에 응답할 수 없었습니다.</p>
              <p className="text-accent-foreground-70 text-sm">응답을 다시 생성해 보세요.</p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={handleRetryMessage}>
              재시도
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotMessageEmpty;
