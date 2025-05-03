import { Skeleton } from "@/shared/ui/skeleton";

const ChatRoomSkeleton = () => (
  <div className="p-2">
    <Skeleton className="h-8 w-full rounded-md" />
    <ul className="space-y-1">
      {Array(5)
        .fill(0)
        .map((_, index) => (
          <li key={index} className="flex items-center justify-between rounded-md p-2">
            <Skeleton className="h-5 w-full rounded-md" />
          </li>
        ))}
    </ul>
  </div>
);

export default ChatRoomSkeleton;
