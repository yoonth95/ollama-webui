import { useState } from "react";
import axios from "axios";
import { useCustomQuery } from "@/shared/hooks/useApiQuery";
import { DisplayType } from "@/shared/hooks/useApiError";
import { ModelInfoArraySchema, ModelInfoType } from "@/shared/types/modelType";

type DisplayErrorType =
  | {
      status: number;
      message: string;
    }
  | undefined;

export const useGetModels = (type: DisplayType) => {
  const [displayError, setDisplayError] = useState<DisplayErrorType>();

  const { data: modelsResponse, isLoading } = useCustomQuery<ModelInfoType[]>(
    ["models"],
    `/model/get-models`,
    ModelInfoArraySchema,
    {
      type,
      customErrorHandler: (error, errorMessage, statusCode) => {
        if (type === "display" && axios.isAxiosError(error)) {
          setDisplayError({
            status: statusCode || 500,
            message: errorMessage || "모델 조회 실패",
          });
        }
      },
    },
    { refetchOnWindowFocus: true },
  );

  return { models: modelsResponse?.data || [], isLoading, displayError };
};
