import { AxiosRequestConfig, AxiosResponse } from "axios";
import { axiosInstance } from "./axiosClient";

export type ApiResponseType<T> = {
  ok: boolean;
  message: string;
  data: T | null;
};

export async function customAxios<T>(
  endpoint: string,
  config: AxiosRequestConfig = {},
): Promise<AxiosResponse<ApiResponseType<T>>> {
  return await axiosInstance({
    url: endpoint,
    ...config,
  });
}
