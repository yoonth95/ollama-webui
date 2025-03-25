import { z } from "zod";
import { useQuery, useMutation, useInfiniteQuery, InfiniteData, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { customAxios } from "@/shared/lib/apiClient";
import { ApiRequestBody, ApiResponse } from "@/shared/lib/apiCaseConverter";
import { useApiError, DisplayType } from "@/shared/hooks/useApiError";
import {
  AxiosInfiniteResponseType,
  ApiResponseType,
  UseCustomInfiniteQueryType,
  UseCustomMutationType,
  UseCustomQueryType,
} from "@/shared/types/apiType";
import { ApiError } from "@/shared/types/apiErrorType";

// GET 요청
/**
 * @param queryKey 쿼리키
 * @param endpoint API 엔드포인트
 * @param schema 응답 데이터 검증을 위한 Zod 스키마
 * @param errorOptions 에러 (선택 사항)
 * @param options React Query 옵션 설정 (선택 사항)
 * @param config axios 설정 (선택 사항)
 * @returns 검증된 데이터와 메타데이터를 포함한 객체
 */
export function useCustomQuery<TRes>({
  queryKey,
  endpoint,
  schema,
  errorOptions = { type: DisplayType.Toast },
  options = {},
  configs = {},
}: UseCustomQueryType<TRes>) {
  const { handleErrorWithOptions } = useApiError();

  return useQuery<ApiResponseType<TRes>, ApiError>({
    queryKey,
    queryFn: async () => {
      try {
        const response = await customAxios(endpoint, { method: "GET", ...configs });

        // 응답 데이터를 camelCase로 변환 및 검증
        const validatedResponse = ApiResponse(schema, response.data);
        if (!validatedResponse) throw new Error("응답 데이터 검증 실패");

        return validatedResponse as ApiResponseType<TRes>;
      } catch (error) {
        const { errorMessage, statusCode } = handleErrorWithOptions(error, errorOptions);
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

// POST, PUT, DELETE 요청
/**
 * @param endpoint API 엔드포인트
 * @param method HTTP 메소드
 * @param responseSchema Zod 검증 스키마 (응답 데이터 검증용) (선택 사항)
 * @param requestSchema Zod 검증 스키마 (요청 데이터 검증용) (선택 사항)
 * @param errorOptions 에러 (선택 사항)
 * @param options React Query 옵션 설정 (선택 사항)
 * @param showToastOnSuccess 성공 시 toast 띄울지 여부 (선택 사항)
 * @param queryKeyToInvalidate 초기화할 쿼리 키 (선택 사항)
 * @returns 검증된 데이터와 메타데이터를 포함한 객체
 */
export function useCustomMutation<TRes = undefined, TReq = undefined>({
  endpoint,
  method,
  responseSchema = undefined,
  requestSchema = undefined,
  errorOptions = { type: DisplayType.Toast },
  showToastOnSuccess = false,
  queryKeyToInvalidate = undefined,
  options = {},
  configs = {},
}: UseCustomMutationType<TRes, TReq>) {
  const { handleErrorWithOptions } = useApiError();
  const queryClient = useQueryClient(); // 쿼리 키 초기화를 위해 추가

  const mutationOptions = {
    ...options,
    onSuccess: (
      data: ApiResponseType<TRes>,
      variables: { data?: TReq; params?: Record<string, string | number> } | TReq | undefined,
      context: unknown,
    ) => {
      // 성공 시 toast 띄우기 (showToastOnSuccess가 true일 때)
      if (showToastOnSuccess && data.message) {
        toast.success(data.message);
      }
      // 쿼리 키 초기화 (queryKeyToInvalidate가 있을 때)
      if (queryKeyToInvalidate) {
        queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
      }
      // 사용자가 options로 전달한 onSuccess가 있으면 실행
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
  };

  return useMutation<
    ApiResponseType<TRes>,
    ApiError,
    { data?: TReq; params?: Record<string, string | number> } | TReq | undefined
  >({
    mutationFn: async (mutationArgs) => {
      // 인자가 { data, params } 형태인지 확인
      const isComplexArgs =
        mutationArgs !== undefined && typeof mutationArgs === "object" && "data" in (mutationArgs as object);

      // 엔드포인트 결정
      const finalEndpoint =
        typeof endpoint === "function"
          ? endpoint(isComplexArgs ? (mutationArgs as { params?: Record<string, string | number> }).params : undefined)
          : endpoint;

      // 데이터 추출
      const data = isComplexArgs ? (mutationArgs as { data?: TReq }).data : mutationArgs;

      // DELETE 요청이고 데이터가 없는 경우 검증 단계 건너뛰기
      let validatedRequestData = undefined;

      // 요청 데이터가 있고 requestSchema가 제공된 경우에만 검증 수행
      if (data !== undefined && requestSchema) {
        const validatedRequest = ApiRequestBody(requestSchema, data, true);
        if (!validatedRequest?.success) throw new Error("요청 데이터 검증 실패");
        validatedRequestData = validatedRequest.data;
      }

      try {
        const response = await customAxios(finalEndpoint, {
          method,
          data: validatedRequestData, // 데이터가 없으면 undefined
          ...configs,
        });

        // responseSchema가 없거나 response.data.data가 null인 경우 검증 건너뛰기
        if (!responseSchema || response.data.data === null) {
          return response.data as ApiResponseType<TRes>;
        }

        // 응답 데이터를 camelCase로 변환 및 검증
        const validatedResponse = ApiResponse(responseSchema, response.data);
        if (!validatedResponse) throw new Error("응답 데이터 검증 실패");

        return validatedResponse as ApiResponseType<TRes>;
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
    ...mutationOptions,
  });
}

// 무한 스크롤링 요청
export function useCustomInfiniteQuery<T>({
  queryKey,
  endpoint,
  schema,
  paginationOptions = {},
  errorOptions = {},
  config = {},
  options = {},
}: UseCustomInfiniteQueryType<T>) {
  const { handleErrorWithOptions } = useApiError();

  // 페이지네이션 파라미터의 기본값 설정
  const { pageParam = 1, limitParam = 20, pageParamName = "page", limitParamName = "limit" } = paginationOptions;

  // 검증 스키마 설정
  const itemsSchema = z.object({
    items: z.array(schema),
    meta: z.object({
      currentPage: z.number(),
      totalPages: z.number().default(0),
      hasNextPage: z.boolean().default(false),
      totalItems: z.number().default(0),
    }),
  });

  return useInfiniteQuery<AxiosInfiniteResponseType<T>, ApiError, InfiniteData<AxiosInfiniteResponseType<T>, unknown>>({
    queryKey,
    queryFn: async ({ pageParam: currentPageParam }) => {
      const currentPage = currentPageParam as number;

      try {
        const response = await customAxios(endpoint, {
          method: "GET",
          ...config,
          params: { ...config.params, [pageParamName]: currentPage, [limitParamName]: limitParam },
        });

        const responseData = response.data;
        if (Array.isArray(responseData.data)) {
          responseData.data = {
            items: responseData.data,
            meta: {
              currentPage,
              totalPages: 0,
              hasNextPage: false,
              totalItems: 0,
            },
          };
        }

        // 응답 데이터를 camelCase로 변환 및 검증
        const validatedResponse = ApiResponse(itemsSchema, responseData);
        if (!validatedResponse) throw new Error("응답 데이터 검증 실패");

        return validatedResponse as AxiosInfiniteResponseType<T>;
      } catch (error) {
        const { errorMessage, statusCode } = handleErrorWithOptions(error, errorOptions);
        throw new ApiError(errorMessage, statusCode, error);
      }
    },
    initialPageParam: pageParam,
    getNextPageParam: (lastPage) => (lastPage.data?.meta?.hasNextPage ? lastPage.data.meta.currentPage + 1 : undefined),
    meta: {
      errorHandled: Boolean(errorOptions && Object.keys(errorOptions).length > 0), // 에러 옵션이 제공된 경우 errorHandled를 true로 설정
      errorOptions, // 에러 옵션 전달
    },
    ...options,
  });
}
