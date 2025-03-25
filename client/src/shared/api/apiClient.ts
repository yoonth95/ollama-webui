import { AxiosRequestConfig, AxiosResponse } from "axios";
import { axiosInstance } from "@/shared/api";
import { ApiResponseType } from "@/shared/types/apiType";

export async function customAxios<T>(
  endpoint: string,
  config: AxiosRequestConfig = {},
): Promise<AxiosResponse<ApiResponseType<T>>> {
  return await axiosInstance({
    url: endpoint,
    ...config,
  });
}
