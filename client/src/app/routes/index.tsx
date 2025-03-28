import DefaultLayout from "./layouts/Default";
import Home from "./pages/Home";
import Chat from "./pages/Chat";

export const routes = [
  {
    path: "/",
    element: <DefaultLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "/chat/:chatRoomId", element: <Chat /> },
    ],
  },
];
