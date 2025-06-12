import Loader from "@/shared/ui/loader";

type ChatRoomLoaderProps = {
  loaderRef: (node?: Element | null) => void;
};

const ChatRoomLoader = ({ loaderRef }: ChatRoomLoaderProps) => {
  return <Loader loaderRef={loaderRef} />;
};

export default ChatRoomLoader;
