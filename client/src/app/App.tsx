import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import { QueryProvider, ThemeProvider, ToastProvider } from "@/app/providers";
import { routes } from "./routes";

export default function App() {
  const router = createBrowserRouter(routes);

  return (
    <QueryProvider>
      <ThemeProvider defaultTheme="dark" storageKey="webui-theme">
        <ToastProvider />
        <CookiesProvider>
          <RouterProvider router={router} />
        </CookiesProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
