import { useState } from "react";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import { ThemeProvider, ToastProvider } from "@/app/providers";
import useApiError from "@/shared/hooks/useApiError";
import { ApiError } from "@/shared/types/apiErrorType";
import { routes } from "./routes";

export default function App() {
  const router = createBrowserRouter(routes);
  const { handleErrorWithOptions } = useApiError();

  const [queryClient] = useState(
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

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="webui-theme">
        <ToastProvider />
        <CookiesProvider>
          <RouterProvider router={router} />
        </CookiesProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
