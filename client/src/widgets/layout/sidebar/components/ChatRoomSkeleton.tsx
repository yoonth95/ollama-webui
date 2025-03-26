import { Skeleton } from "@/shared/ui/skeleton";

const ChatRoomSkeleton = () => (
  <div className="mb-8">
    <ul className="space-y-1">
      {Array(3)
        .fill(0)
        .map((_, index) => (
          <li key={index} className="flex items-center justify-between rounded-md p-2">
            <Skeleton className="h-6 w-full rounded-md" />
          </li>
        ))}
    </ul>
  </div>
);

export default ChatRoomSkeleton;
