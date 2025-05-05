import { Button } from "@/shared/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";

const SidebarError = ({ refetch }: { refetch: () => void }) => {
  return (
    <div className="flex h-full flex-col items-center justify-start p-4">
      <Alert variant="destructive" className="mb-4 max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>오류 발생</AlertTitle>
        <AlertDescription>사이드바 데이터를 불러오는 중 오류가 발생했습니다.</AlertDescription>
      </Alert>

      <Button onClick={() => refetch()} variant="outline" className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4" />
        다시 시도
      </Button>
    </div>
  );
};

export default SidebarError;
