import MarkdownViewer from "@/features/markdown/MarkdownViewer";

const UserChatBox = ({ content }: { content: string }) => {
  return (
    <article className="w-full overflow-hidden">
      <div className="mx-auto my-auto overflow-hidden px-6 py-[18px] text-base">
        <div className="mx-auto flex w-full flex-1 justify-end gap-4 overflow-hidden text-base md:max-w-[40rem] md:gap-5 lg:gap-6 xl:max-w-[46rem]">
          <div className="max-w-[100%] overflow-hidden px-3 sm:max-w-[80%]">
            <div className="dark:bg-accent bg-accent overflow-hidden rounded-2xl px-5 py-2 break-words">
              <MarkdownViewer content={content} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default UserChatBox;
