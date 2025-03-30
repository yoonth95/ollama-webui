import { useState } from "react";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useApiError } from "@/shared/api/useApiError";
import { ApiError } from "@/shared/types/apiErrorType";

interface QueryProviderProps {
  children: React.ReactNode;
}
export function QueryProvider({ children }: QueryProviderProps) {
  const { handleErrorWithOptions } = useApiError();

  // useState를 사용하여 QueryClient 인스턴스를 컴포넌트 생명주기 동안 유지
  // 컴포넌트가 리렌더링되어도 항상 동일한 인스턴스 참조
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          mutations: {
            networkMode: "always",
          },
          queries: {
            networkMode: "always",
            retry: false,
          },
        },
        queryCache: new QueryCache({
          onError: (error, query) => {
            if (query.meta?.errorHandled) return; // query 레벨에서 에러가 처리되었으면 글로벌 처리 생략
            handleErrorWithOptions(error as ApiError);
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            if (mutation.meta?.errorHandled) return; // mutation 레벨에서 에러가 처리되었으면 글로벌 처리 생략
            handleErrorWithOptions(error as ApiError);
          },
        }),
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
