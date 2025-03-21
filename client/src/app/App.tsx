import { useState } from "react";
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import { ThemeProvider, ToastProvider } from "@/app/providers";
import { routes } from "./routes";

export default function App() {
  const router = createBrowserRouter(routes);

  const [queryClient] = useState(
    new QueryClient({
      defaultOptions: {
        mutations: {
          // onError: handleError,
          networkMode: "always",
        },
        queries: {
          networkMode: "always",
        },
      },
      queryCache: new QueryCache({
        // onError: handleError,
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
