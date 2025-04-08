import { Skeleton } from "@/shared/ui/skeleton";

const ChatMessageSkeleton = () => {
  return (
    <div className="mb-8 flex items-center justify-center">
      <div className="flex w-full flex-col gap-5 px-3 text-base md:w-[42rem] xl:w-[48rem]">
        <div className="flex flex-col items-end">
          <Skeleton className="h-20 w-[100%] rounded-3xl rounded-br-sm px-5 py-2 sm:w-[90%] md:w-[80%]" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-[90%] rounded-none" />
          <Skeleton className="h-4 w-[70%] rounded-none" />
          <Skeleton className="h-4 w-[80%] rounded-none" />
          <Skeleton className="h-4 w-[50%] rounded-none" />
        </div>
      </div>
    </div>
  );
};

export default ChatMessageSkeleton;
