import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  InfiniteData,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import { ApiRequestBody, ApiResponse, ApiRequestParams, customAxios, useErrorHandler } from "@/shared/api";
import {
  DisplayType,
  ApiResponseType,
  UseCustomInfiniteQueryType,
  UseCustomMutationType,
  UseCustomQueryType,
  AxiosInfiniteResponseType,
  PaginationMeta,
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
  const { withErrorHandling } = useErrorHandler();

  return useQuery<ApiResponseType<TRes>, ApiError>({
    queryKey,
    queryFn: withErrorHandling(async () => {
      const response = await customAxios(endpoint, { method: "GET", ...configs });

      // 응답 데이터를 camelCase로 변환 및 검증
      const validatedResponse = ApiResponse(schema, response.data);
      if (!validatedResponse) throw new Error("응답 데이터 검증 실패");

      return validatedResponse as ApiResponseType<TRes>;
    }, errorOptions),
    meta: {
      errorHandled: Boolean(errorOptions && Object.keys(errorOptions).length > 0), // 에러 옵션이 제공된 경우 errorHandled를 true로 설정
      errorOptions, // 에러 옵션 전달
    },
    ...options,
  });
}

// GET 요청 Suspense 모드
/**
 * @param queryKey 쿼리키
 * @param endpoint API 엔드포인트
 * @param schema 응답 데이터 검증을 위한 Zod 스키마
 * @param errorOptions 에러 (선택 사항)
 * @param options React Query 옵션 설정 (선택 사항)
 * @param config axios 설정 (선택 사항)
 * @returns 검증된 데이터와 메타데이터를 포함한 객체
 */
export function useCustomSuspenseQuery<TRes>({
  queryKey,
  endpoint,
  schema,
  errorOptions = { type: DisplayType.Toast },
  options = {},
  configs = {},
}: UseCustomQueryType<TRes>) {
  const { withErrorHandling } = useErrorHandler();

  return useSuspenseQuery<ApiResponseType<TRes>, ApiError>({
    queryKey,
    queryFn: withErrorHandling(async () => {
      const response = await customAxios(endpoint, { method: "GET", ...configs });

      // 응답 데이터를 camelCase로 변환 및 검증
      const validatedResponse = ApiResponse(schema, response.data);
      if (!validatedResponse) throw new Error("응답 데이터 검증 실패");

      return validatedResponse as ApiResponseType<TRes>;
    }, errorOptions),
    meta: {
      errorHandled: Boolean(errorOptions && Object.keys(errorOptions).length > 0),
      errorOptions,
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
 * @param paramsSchema Zod 검증 스키마 (파라미터 검증용) (선택 사항)
 * @param errorOptions 에러 (선택 사항)
 * @param options React Query 옵션 설정 (선택 사항)
 * @param showToastOnSuccess 성공 시 toast 띄울지 여부 (선택 사항)
 * @param queryKeyToInvalidate 초기화할 쿼리 키 (선택 사항)
 * @param queryKeyToRemove 제거할 쿼리 키 (선택 사항)
 * @returns 검증된 데이터와 메타데이터를 포함한 객체
 */
export function useCustomMutation<TRes = undefined, TReq = undefined, TParams = Record<string, string | number>>({
  endpoint,
  method,
  responseSchema = undefined,
  requestSchema = undefined,
  paramsSchema = undefined,
  errorOptions = { type: DisplayType.Toast },
  showToastOnSuccess = false,
  queryKeyToInvalidate = undefined,
  queryKeyToRemove = undefined,
  options = {},
  configs = {},
}: UseCustomMutationType<TRes, TReq, TParams>) {
  const { withErrorHandling } = useErrorHandler();
  const queryClient = useQueryClient(); // 쿼리 키 초기화를 위해 추가

  const mutationOptions = {
    ...options,
    onSuccess: (
      data: ApiResponseType<TRes>,
      variables: { data?: TReq; params?: TParams } | TReq | undefined,
      context: unknown,
    ) => {
      // 성공 시 toast 띄우기 (showToastOnSuccess가 true일 때)
      if (showToastOnSuccess && data.message) {
        toast.success(data.message);
      }

      // 쿼리 키 배열 처리 함수 (단일/다중 모두 지원)
      const processQueryKeys = (keys: string[] | string[][] | undefined, action: "invalidate" | "remove") => {
        if (!keys) return;
        const keyArray: string[][] = Array.isArray(keys[0]) ? (keys as string[][]) : [keys as string[]];
        keyArray.forEach((key) => {
          if (action === "invalidate") {
            queryClient.invalidateQueries({ queryKey: key });
          } else {
            queryClient.removeQueries({ queryKey: key });
          }
        });
      };

      // 무효화 및 제거 처리
      processQueryKeys(queryKeyToInvalidate, "invalidate");
      processQueryKeys(queryKeyToRemove, "remove");

      // 사용자가 options로 전달한 onSuccess가 있으면 실행
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
  };

  return useMutation<ApiResponseType<TRes>, ApiError, { data?: TReq; params?: TParams } | TReq | undefined>({
    mutationFn: withErrorHandling(async (mutationArgs) => {
      // 인자가 { data, params } 형태인지 확인
      const isComplexArgs =
        mutationArgs !== undefined &&
        typeof mutationArgs === "object" &&
        ("data" in (mutationArgs as object) || "params" in (mutationArgs as object));

      // 데이터 추출
      const data = isComplexArgs ? (mutationArgs as { data?: TReq }).data : mutationArgs;

      // params 추출
      const params = (mutationArgs as { params?: TParams }).params;

      // params 추출 및 검증
      let validatedParams;
      if (isComplexArgs && paramsSchema) {
        if (params) {
          const validated = paramsSchema.parse(params);
          validatedParams = ApiRequestParams(paramsSchema, validated as Record<string, unknown>);
        }
      }

      // 엔드포인트 결정
      const finalEndpoint = typeof endpoint === "function" ? endpoint(isComplexArgs ? params : undefined) : endpoint;

      // 요청 데이터가 있고 requestSchema가 제공된 경우에만 검증 수행
      let validatedRequestData;
      if (data !== undefined && requestSchema) {
        const validatedRequest = ApiRequestBody(requestSchema, data, true);
        validatedRequestData = validatedRequest?.success ? validatedRequest.data : undefined;
      }

      const response = await customAxios(finalEndpoint, {
        method,
        data: validatedRequestData,
        params: validatedParams,
        ...configs,
      });

      // responseSchema가 없거나 response.data.data가 null인 경우 검증 건너뛰기
      if (!responseSchema || response.data.data === null) {
        return response.data as ApiResponseType<TRes>;
      }

      // 응답 데이터를 camelCase로 변환 및 검증
      const validatedResponse = ApiResponse(responseSchema, response.data);
      return validatedResponse as ApiResponseType<TRes>;
    }, errorOptions),
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
  const { withErrorHandling } = useErrorHandler();

  const { pageParam = 1, limitParam = 20, pageParamName = "page", limitParamName = "limit" } = paginationOptions;

  return useInfiniteQuery<AxiosInfiniteResponseType<T>, ApiError, InfiniteData<AxiosInfiniteResponseType<T>, number>>({
    queryKey,
    queryFn: withErrorHandling(async ({ pageParam: currentPageParam }) => {
      const currentPage = currentPageParam as number;

      const response = await customAxios(endpoint, {
        method: "GET",
        ...config,
        params: { ...config.params, [pageParamName]: currentPage, [limitParamName]: limitParam },
      });

      const validatedResponse = ApiResponse(schema, response.data);
      if (!validatedResponse) throw new Error("응답 데이터 검증 실패");

      return validatedResponse as AxiosInfiniteResponseType<T>;
    }, errorOptions),
    initialPageParam: pageParam,
    getNextPageParam: (lastPage) => {
      if (lastPage.data && typeof lastPage.data === "object" && "meta" in lastPage.data) {
        const meta = lastPage.data.meta as PaginationMeta;
        return meta.hasNextPage ? meta.currentPage + 1 : undefined;
      }
      return undefined;
    },
    meta: {
      errorHandled: Boolean(errorOptions && Object.keys(errorOptions).length > 0),
      errorOptions,
    },
    ...options,
  });
}
