import DefaultLayout from "./layouts/Default";
import Home from "./pages/Home";
import ChatRoom from "./pages/ChatRoom";

export const routes = [
  {
    path: "/",
    element: <DefaultLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "/chat/:ChatRoomId", element: <ChatRoom /> },
    ],
  },
];
