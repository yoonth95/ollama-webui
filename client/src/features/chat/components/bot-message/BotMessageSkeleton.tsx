const BotMessageSkeleton = () => {
  return (
    <article className="bot-message flex w-full justify-start">
      <div className="flex max-w-[85%] animate-pulse items-start">
        <div className="mr-3 h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700"></div>
        <div className="flex flex-col gap-2">
          <div className="h-4 w-20 rounded bg-gray-300 dark:bg-gray-700"></div>
          <div className="h-16 w-64 rounded-lg bg-gray-300 dark:bg-gray-700"></div>
        </div>
      </div>
    </article>
  );
};

export default BotMessageSkeleton;
