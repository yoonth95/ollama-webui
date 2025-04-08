import { Button } from "@/shared/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-5">
      <h1 className="text-3xl font-bold">404 Not Found</h1>
      <div className="text-accent-foreground-70 flex flex-col items-center gap-1 text-sm">
        <p>페이지를 찾을 수 없습니다.</p>
        <p>올바른 URL을 사용하고 있는지 확인해주세요.</p>
      </div>
      <Button variant="outline" onClick={() => navigate("/")}>
        홈으로 돌아가기
      </Button>
    </div>
  );
};

export default NotFound;
