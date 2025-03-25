import { useState } from "react";
import axios from "axios";
import { useCustomQuery, queryKeys } from "@/shared/api";
import { ModelInfoArraySchema, ModelInfoType } from "@/shared/types/modelType";
import { DisplayType } from "@/shared/types/apiType";

type DisplayErrorType =
  | {
      status: number;
      message: string;
    }
  | undefined;

export const useGetModels = (type: DisplayType) => {
  const [displayError, setDisplayError] = useState<DisplayErrorType>();

  const { data: modelsResponse, isLoading } = useCustomQuery<ModelInfoType[]>({
    queryKey: queryKeys.models.list(),
    endpoint: `/model/get-models`,
    schema: ModelInfoArraySchema,
    errorOptions: {
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
    options: { refetchOnWindowFocus: true },
  });

  return { models: modelsResponse?.data || [], isLoading, displayError };
};
