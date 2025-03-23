import { DisplayType } from "@/shared/hooks/useApiError";
import { useCustomMutation } from "@/shared/hooks/useApiQuery";

type DeleteModelResponse = {
  ok: boolean;
  message: string;
  data: null;
};

export const useDeleteModel = (modelName: string) => {
  return useCustomMutation<DeleteModelResponse, undefined>(
    `/model/delete/${modelName}`,
    "DELETE",
    undefined, // 응답 스키마는 정의하지 않음
    undefined, // 요청 스키마는 없음
    { type: DisplayType.Toast }, // 에러는 Toast로 표시 (이 옵션이 있으면 useCustomMutation에서 meta.errorHandled = true가 됨)
  );
};
