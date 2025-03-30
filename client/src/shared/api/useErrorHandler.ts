import { ErrorHandlingOptions, useApiError } from "@/shared/api/useApiError";
import { DisplayType } from "@/shared/types/apiType";
import { ApiError } from "@/shared/types/apiErrorType";

export const useErrorHandler = () => {
  const { handleErrorWithOptions } = useApiError();

  return {
    withErrorHandling: <T, Args extends unknown[] = []>(
      fn: (...args: Args) => Promise<T>,
      errorOptions: ErrorHandlingOptions = { type: DisplayType.Toast },
    ) => {
      return async (...args: Args) => {
        try {
          return await fn(...args);
        } catch (error) {
          const { errorMessage, statusCode } = handleErrorWithOptions(error, errorOptions);
          throw new ApiError(errorMessage, statusCode, error);
        }
      };
    },
  };
};
