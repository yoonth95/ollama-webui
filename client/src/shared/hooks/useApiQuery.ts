import { z } from "zod";
import { AxiosRequestConfig } from "axios";
import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import useApiError, { ErrorHandlingOptions } from "@/shared/hooks/useApiError";
import { customAxios } from "@/shared/lib/apiClient";
import { ApiError } from "@/shared/types/apiErrorType";
import { ApiRequestBody, ApiResponse } from "../lib/apiCaseConverter";

export type AxiosResultType<T> = {
  ok: boolean;
  message: string;
  data: T | null;
};

// GET 요청
/**
 * 커스텀 fetch 함수
 * @param queryKey 쿼리키
 * @param endpoint API 엔드포인트
 * @param schema Zod 검증 스키마 (응답 데이터 검증용)
 * @param errorOptions 에러 (선택 사항)
 * @param config axios 설정 (선택 사항)
 * @param options React Query 옵션 설정 (선택 사항)
 * @returns 검증된 데이터와 메타데이터를 포함한 객체
 */
export function useCustomQuery<T>(
  queryKey: string[],
  endpoint: string,
  schema: z.ZodType<T>,
  errorOptions: ErrorHandlingOptions = {},
  options: Omit<UseQueryOptions<AxiosResultType<T>, ApiError>, "queryKey" | "queryFn"> = {},
  config: AxiosRequestConfig = {},
) {
  const { handleErrorWithOptions } = useApiError();

  return useQuery<AxiosResultType<T>, ApiError>({
    queryKey,
    queryFn: async () => {
      try {
        const response = await customAxios(endpoint, { method: "GET", ...config });
        const validatedResponse = ApiResponse(schema, response.data);
        if (!validatedResponse) {
          throw new Error("응답 데이터 검증 실패");
        }
        return validatedResponse as AxiosResultType<T>;
      } catch (error) {
        const { errorMessage, statusCode } = handleErrorWithOptions(error, errorOptions);
        throw new ApiError(errorMessage, statusCode, error);
      }
    },
    meta: {
      errorHandled: true, // 쿼리 레벨에서 에러가 처리되었음을 표시
      errorOptions, // 에러 옵션 전달
    },
    ...options,
  });
}

// POST, PUT, DELETE 요청
/**
 * 커스텀 fetch 함수
 * @param endpoint API 엔드포인트
 * @param method HTTP 메소드
 * @param responseSchema Zod 검증 스키마 (응답 데이터 검증용) (선택 사항)
 * @param requestSchema Zod 검증 스키마 (요청 데이터 검증용) (선택 사항)
 * @param errorOptions 에러 (선택 사항)
 * @param options React Query 옵션 설정 (선택 사항)
 * @returns 검증된 데이터와 메타데이터를 포함한 객체
 */
export function useCustomMutation<TRes = null, TReq = undefined>(
  endpoint: string,
  method: "POST" | "PUT" | "DELETE" | "PATCH",
  responseSchema?: z.ZodType<TRes>,
  requestSchema?: z.ZodType<TReq>,
  errorOptions: ErrorHandlingOptions = {},
  options: Omit<UseMutationOptions<AxiosResultType<TRes>, ApiError, TReq | undefined>, "mutationFn"> = {},
) {
  const { handleErrorWithOptions } = useApiError();

  return useMutation<AxiosResultType<TRes>, ApiError, TReq | undefined>({
    mutationFn: async (data?: TReq) => {
      // DELETE 요청이고 데이터가 없는 경우 검증 단계 건너뛰기
      let validatedRequestData = undefined;

      // 요청 데이터가 있고 requestSchema가 제공된 경우에만 검증 수행
      if (data !== undefined && requestSchema) {
        const validatedRequest = ApiRequestBody(requestSchema, data, true);
        if (!validatedRequest?.success) {
          throw new Error("요청 데이터 검증 실패");
        }
        validatedRequestData = validatedRequest.data;
      }

      try {
        const response = await customAxios(endpoint, {
          method,
          data: validatedRequestData, // 데이터가 없으면 undefined
        });

        // responseSchema가 없거나 response.data.data가 null인 경우 검증 건너뛰기
        if (!responseSchema || response.data.data === null) {
          return response.data as AxiosResultType<TRes>;
        }

        // 응답 데이터를 camelCase로 변환 및 검증
        const validatedResponse = ApiResponse(responseSchema, response.data);
        if (!validatedResponse) {
          throw new Error("응답 데이터 검증 실패");
        }
        return validatedResponse as AxiosResultType<TRes>;
      } catch (error) {
        const { errorMessage, statusCode } = handleErrorWithOptions(error, errorOptions);
        console.log(errorMessage, statusCode);
        throw new ApiError(errorMessage, statusCode, error);
      }
    },
    meta: {
      errorHandled: Boolean(errorOptions && Object.keys(errorOptions).length > 0), // 에러 옵션이 제공된 경우 errorHandled를 true로 설정
      errorOptions, // 에러 옵션 전달
    },
    ...options,
  });
}
