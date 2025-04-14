import { AxiosRequestConfig } from "axios";
import { InfiniteData, UseInfiniteQueryOptions, UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { ErrorHandlingOptions } from "@/shared/api/useApiError";
import { ApiError } from "@/shared/types/apiErrorType";

export enum DisplayType {
  Toast = "toast",
  Modal = "modal",
  Alert = "alert",
  Display = "display",
}

// Axios Response 타입
export type ApiResponseType<T = null> = {
  ok: boolean;
  message: string;
  data: T | null;
};

// useQuery 타입
export type UseCustomQueryType<TRes> = {
  queryKey: string[];
  endpoint: string;
  schema: z.ZodType<TRes>;
  errorOptions?: ErrorHandlingOptions;
  configs?: Omit<AxiosRequestConfig, "method" | "data">;
  options?: Omit<UseQueryOptions<ApiResponseType<TRes>, ApiError>, "queryKey" | "queryFn">;
};

// useMutation 타입
export type UseCustomMutationType<TRes = undefined, TReq = undefined, TParams = Record<string, string | number>> = {
  endpoint: string | ((params?: TParams) => string);
  method: "POST" | "PUT" | "DELETE" | "PATCH";
  responseSchema?: z.ZodType<TRes>;
  requestSchema?: z.ZodType<TReq>;
  paramsSchema?: z.ZodType<TParams>;
  errorOptions?: ErrorHandlingOptions;
  showToastOnSuccess?: boolean;
  queryKeyToInvalidate?: string[];
  configs?: Omit<AxiosRequestConfig, "method" | "data">;
  options?: Omit<
    UseMutationOptions<ApiResponseType<TRes>, ApiError, { data?: TReq; params?: TParams } | TReq | undefined>,
    "mutationFn"
  >;
};

// 무한 스크롤/페이지네이션을 위한 메타데이터 타입
export type PaginationMeta = {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  totalItems?: number;
};

// 페이지네이션 파라미터 타입
export type PaginationParams = {
  pageParam?: number;
  limitParam?: number;
  pageParamName?: string;
  limitParamName?: string;
};

// API 응답에 pagination 메타데이터를 포함하는 타입
export type AxiosInfiniteResponseType<T> = ApiResponseType<T>;

// useInfiniteQuery 타입
export type UseCustomInfiniteQueryType<T> = {
  queryKey: string[];
  endpoint: string;
  schema: z.ZodType<T>;
  paginationOptions?: PaginationParams;
  errorOptions?: ErrorHandlingOptions;
  config?: AxiosRequestConfig;
  options?: Omit<
    UseInfiniteQueryOptions<AxiosInfiniteResponseType<T>, ApiError, InfiniteData<AxiosInfiniteResponseType<T>, number>>,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
  >;
};
