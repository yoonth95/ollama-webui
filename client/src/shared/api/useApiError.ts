import axios from "axios";
import { toast } from "react-toastify";
import { DisplayType } from "@/shared/types/apiType";

export type ErrorResponse = {
  ok: boolean;
  message: string;
  data: null;
  status?: number;
};

export type ErrorHandlingOptions = {
  type?: DisplayType;
  customErrorHandler?: (error: unknown, errorMessage: string, statusCode: number) => void;
};

export const useApiError = () => {
  const processError = (error: unknown) => {
    let errorMessage = "네트워크 연결 오류 또는 기타 오류가 발생했습니다.";
    let statusCode = 500;

    if (axios.isAxiosError(error)) {
      // 완전한 서버 연결 실패 케이스
      if (
        !error.response ||
        error.code === "ECONNABORTED" ||
        error.code === "ETIMEDOUT" ||
        error.message.includes("Network Error")
      ) {
        errorMessage = "서버 연결이 원활하지 않습니다.";
        statusCode = 500;
      }
      // 프록시나 서버에서 잘못된 응답을 준 경우
      else if (error.code === "ERR_BAD_RESPONSE") {
        if (!error.response?.data) {
          errorMessage = "서버 연결이 원활하지 않습니다.";
          statusCode = 500;
        } else {
          errorMessage = error.response.data.message || "서버 응답이 올바르지 않습니다.";
          statusCode = error.response.status;
        }
      }
      // 정상적인 에러 응답
      else if (error.response?.data) {
        statusCode = error.response.status;
        const errorResponse = error.response.data as ErrorResponse;
        errorMessage = errorResponse?.message || "오류가 발생했습니다.";
      }
      // 기타 예상치 못한 응답 형식
      else {
        errorMessage = "예상치 못한 응답 형식입니다.";
        statusCode = error.response?.status || 500;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { errorMessage, statusCode };
  };

  const showError = (type: string, message: string, statusCode: number) => {
    switch (type) {
      case DisplayType.Toast:
        toast.error(message, {
          style: {
            whiteSpace: "pre-line",
          },
        });
        break;
      case DisplayType.Modal:
        // 모달 로직 추가
        break;
      default:
        console.error(`Error: ${message} (Status: ${statusCode})`);
    }
  };

  const handleErrorWithOptions = (error: unknown, options: ErrorHandlingOptions = {}) => {
    const { type = "toast", customErrorHandler } = options;
    const { errorMessage, statusCode } = processError(error);

    if (customErrorHandler) {
      customErrorHandler(error, errorMessage, statusCode);
    }

    if (type !== "display") {
      showError(type, errorMessage, statusCode);
    }

    return { errorMessage, statusCode };
  };

  return { handleErrorWithOptions };
};
