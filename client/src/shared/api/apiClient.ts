import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { ApiResponseType } from "@/shared/types/apiType";

export const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v1`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function customAxios<T>(
  endpoint: string,
  config: AxiosRequestConfig = {},
): Promise<AxiosResponse<ApiResponseType<T>>> {
  return await axiosInstance({
    url: endpoint,
    ...config,
  });
}
