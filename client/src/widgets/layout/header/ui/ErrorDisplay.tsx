import { AlertCircle, ExternalLink } from "lucide-react";

interface ErrorDisplayProps {
  error: {
    status: number;
    message: string;
  };
}

const ErrorDisplay = ({ error: { status, message } }: ErrorDisplayProps) => {
  const isServiceUnavailable = status === 503;

  return (
    <div className="flex flex-col items-center justify-center space-y-2 p-5 text-center">
      <AlertCircle className="h-6 w-6 text-red-500" />
      <div className="space-y-1">
        {isServiceUnavailable ? (
          <>
            <p className="mb-2 w-[300px] font-medium">{message}</p>
            <a
              href="https://ollama.com/download"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-background px-4 py-2"
            >
              Ollama 다운로드
              <ExternalLink className="h-4 w-4" />
            </a>
          </>
        ) : (
          <>
            <p className="font-medium">{message}</p>
            <p className="text-sm text-muted-foreground">잠시 후 다시 시도해 주세요.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;
