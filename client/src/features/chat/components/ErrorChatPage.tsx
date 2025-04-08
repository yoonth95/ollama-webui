import { Button } from "@/shared/ui/button";
import { useNavigate } from "react-router-dom";

const ErrorChatPage = () => {
  const navigate = useNavigate();

  return (
    <div className="mt-[-6rem] flex h-screen w-full flex-col items-center justify-center gap-5">
      <h1 className="text-3xl font-bold">채팅방을 찾을 수 없습니다</h1>
      <div className="text-accent-foreground-70 flex flex-col items-center gap-1 text-sm">
        <p>찾으시는 채팅방이 존재하지 않거나 이미 삭제되었습니다.</p>
        <p>홈으로 돌아가서 새로운 대화를 시작해 보세요.</p>
      </div>
      <Button variant="outline" onClick={() => navigate("/")}>
        홈으로 돌아가기
      </Button>
    </div>
  );
};

export default ErrorChatPage;
