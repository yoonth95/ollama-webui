import MarkdownRenderer from "@/features/chatMessage/MarkdownRenderer";

const BotChatBox = ({ content }: { content: string }) => {
  return (
    <article className="w-full">
      <div className="mx-auto my-auto py-[18px] text-base">
        <div className="mx-auto flex w-full flex-1 justify-start gap-4 text-base md:max-w-[40rem] md:gap-5 lg:gap-6 xl:max-w-[48rem]">
          <div className="max-w-full">
            <div className="break-words rounded-2xl px-4 py-2 dark:bg-transparent">
              <MarkdownRenderer content={content} type="Bot" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BotChatBox;
