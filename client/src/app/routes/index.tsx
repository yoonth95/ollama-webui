import DefaultLayout from "./layouts/Default";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";

export const routes = [
  {
    path: "/",
    element: <DefaultLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "/chat/:chatRoomId", element: <Chat /> },
    ],
  },
  { path: "*", element: <NotFound /> },
];
