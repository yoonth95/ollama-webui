import { LoaderCircle } from "lucide-react";

type ChatRoomLoaderProps = {
  loaderRef: (node?: Element | null) => void;
};

const ChatRoomLoader = ({ loaderRef }: ChatRoomLoaderProps) => {
  return (
    <div ref={loaderRef} className="text-muted-foreground flex min-h-9 items-center justify-center text-sm">
      <LoaderCircle className="h-6 w-6 animate-spin" />
    </div>
  );
};

export default ChatRoomLoader;
