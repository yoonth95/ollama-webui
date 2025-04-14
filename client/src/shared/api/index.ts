import { ApiResponse, ApiRequestBody, ApiRequestParams } from "./apiCaseConverter";
import { customAxios } from "./apiClient";
import { queryKeys } from "./queryKeys";
import { useApiError } from "./useApiError";
import { useErrorHandler } from "./useErrorHandler";
import { useCustomQuery, useCustomMutation, useCustomInfiniteQuery, useCustomSuspenseQuery } from "./useApiQuery";

export {
  ApiResponse,
  ApiRequestBody,
  ApiRequestParams,
  customAxios,
  queryKeys,
  useApiError,
  useErrorHandler,
  useCustomQuery,
  useCustomMutation,
  useCustomInfiniteQuery,
  useCustomSuspenseQuery,
};
