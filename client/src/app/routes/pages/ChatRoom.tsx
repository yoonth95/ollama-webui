import React from "react";
import { useParams } from "react-router-dom";

const ChatRoom = () => {
  const { ChatRoomId } = useParams();
  console.log(ChatRoomId);

  return <div>ChatRoom</div>;
};

export default ChatRoom;
