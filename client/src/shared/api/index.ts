import { ApiResponse, ApiRequestBody } from "./apiCaseConverter";
import { customAxios } from "./apiClient";
import { queryKeys } from "./queryKeys";
import { useApiError } from "./useApiError";
import { useCustomQuery } from "./useApiQuery";
import { useCustomMutation } from "./useApiQuery";
import { useCustomInfiniteQuery } from "./useApiQuery";
import { useErrorHandler } from "./useErrorHandler";

export {
  ApiResponse,
  ApiRequestBody,
  customAxios,
  queryKeys,
  useApiError,
  useCustomQuery,
  useCustomMutation,
  useCustomInfiniteQuery,
  useErrorHandler,
};
