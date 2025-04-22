import { Button } from "@/shared/ui/button";
import { TooltipContainer } from "@/shared/components";
import { useChatOptimisticStore } from "@/shared/stores/useChatOptimisticStore";
import { useSSEEventSourceStore } from "@/shared/stores/useSSEEventSourceStore";
import { useEditorImageStore } from "@/features/chatEditor/stores/EditorImageStore";
import { useChatControl } from "@/features/chat/hooks/useChatControl";
import { CircleStop, LoaderCircle, Send } from "lucide-react";

interface ChatSendButtonPropsType {
  chatRoomId: string;
  hasValidContent: boolean;
  isPending: boolean;
  onSubmit: () => void;
}
const ChatSendButton = ({ chatRoomId, hasValidContent, isPending, onSubmit }: ChatSendButtonPropsType) => {
  const images = useEditorImageStore((state) => state.images);
  const { cancelChat } = useChatControl(chatRoomId);
  const isCreateRoomLoading = useChatOptimisticStore((state) => state.isCreateRoomLoading);
  const isStartSSE = useSSEEventSourceStore((state) => state.isStartSSE);

  // 입력 내용, 이미지 모두 없는 경우 전송 버튼 비활성화
  const hasNoContent = !hasValidContent && images.length === 0;

  // 아이콘 표시 조건
  const showLoader = isCreateRoomLoading || isPending; // 채팅방 생성 중이거나 요청 대기 중일 때 로더 표시

  return (
    <>
      {isStartSSE ? (
        <TooltipContainer message="답변 중단">
          <Button
            variant="ghost"
            size="icon"
            aria-label="답변 중단"
            className="bg-foreground text-background hover:bg-foreground/70 hover:text-background hover:dark:bg-muted-foreground hover:dark:text-background h-8 w-8 rounded-full"
            onClick={cancelChat}
          >
            <CircleStop />
          </Button>
        </TooltipContainer>
      ) : (
        <TooltipContainer message="질문 보내기">
          <Button
            variant="ghost"
            size="icon"
            aria-label="질문 보내기"
            className="bg-foreground text-background hover:bg-foreground/70 hover:text-background hover:dark:bg-muted-foreground hover:dark:text-background h-8 w-8 rounded-full"
            onClick={onSubmit}
            disabled={isStartSSE || isPending || hasNoContent} // sse 수신 중이거나, 채팅방 생성 중이거나, 입력 내용이 없으면 비활성화
          >
            {showLoader ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </TooltipContainer>
      )}
    </>
  );
};

export default ChatSendButton;
