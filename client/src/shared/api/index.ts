import { ApiResponse, ApiRequestBody } from "./apiCaseConverter";
import { customAxios } from "./apiClient";
import { axiosInstance } from "./axiosClient";
import { queryKeys } from "./queryKeys";
import { useApiError } from "./useApiError";
import { useCustomQuery } from "./useApiQuery";
import { useCustomMutation } from "./useApiQuery";
import { useCustomInfiniteQuery } from "./useApiQuery";

export {
  ApiResponse,
  ApiRequestBody,
  customAxios,
  axiosInstance,
  queryKeys,
  useApiError,
  useCustomQuery,
  useCustomMutation,
  useCustomInfiniteQuery,
};
