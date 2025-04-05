import MarkdownViewer from "@/features/markdown/MarkdownViewer";

const BotChatBox = ({ content }: { content: string }) => {
  return (
    <article className="w-full">
      <div className="mx-auto my-auto py-[18px] text-base">
        <div className="mx-auto flex w-full flex-1 justify-start gap-4 text-base md:max-w-[40rem] md:gap-5 lg:gap-6 xl:max-w-[46rem]">
          <div className="max-w-[100%] px-3">
            <div className="rounded-2xl px-4 py-2 break-words dark:bg-transparent">
              <MarkdownViewer content={content} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BotChatBox;
