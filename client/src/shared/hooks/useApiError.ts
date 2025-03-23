import { useCallback } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export type ErrorResponse = {
  ok: boolean;
  message: string;
  data: null;
  status?: number;
};

export enum DisplayType {
  Toast = "toast",
  Modal = "modal",
  Alert = "alert",
  Display = "display",
}

export type ErrorHandlingOptions = {
  type?: DisplayType;
  customErrorHandler?: (error: unknown, errorMessage: string, statusCode: number) => void;
};

const useApiError = () => {
  const processError = useCallback((error: unknown) => {
    let errorMessage = "네트워크 연결 오류 또는 기타 오류가 발생했습니다.";
    let statusCode = 500;

    if (axios.isAxiosError(error)) {
      if (error.response) {
        statusCode = error.response.status;
        const errorResponse = error.response.data as ErrorResponse;
        errorMessage = errorResponse?.message || "오류가 발생했습니다.";
      } else {
        errorMessage = "서버 연결이 원활하지 않습니다.";
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { errorMessage, statusCode };
  }, []);

  const showError = useCallback((type: string, message: string, statusCode: number) => {
    switch (type) {
      case "toast":
        toast.error(message);
        break;
      // modal, alert 등 추가
      default:
        console.error(`Error: ${message} (Status: ${statusCode})`);
    }
  }, []);

  const handleErrorWithOptions = useCallback(
    (error: unknown, options: ErrorHandlingOptions = {}) => {
      const { type = "toast", customErrorHandler } = options;
      const { errorMessage, statusCode } = processError(error);

      if (customErrorHandler) {
        customErrorHandler(error, errorMessage, statusCode);
      }

      if (type !== "display") {
        showError(type, errorMessage, statusCode);
      }

      return { errorMessage, statusCode };
    },
    [processError, showError],
  );

  return { handleErrorWithOptions };
};

export default useApiError;
