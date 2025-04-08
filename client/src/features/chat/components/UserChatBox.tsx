import MarkdownViewer from "@/features/markdown/MarkdownViewer";

const UserChatBox = ({ content }: { content: string }) => {
  return (
    <article className="user-message flex w-full justify-end">
      <div className="max-w-[100%] px-3 sm:max-w-[90%] md:max-w-[80%]">
        <div className="dark:bg-accent bg-accent rounded-3xl rounded-br-sm px-5 py-2 break-words">
          <MarkdownViewer content={content} />
        </div>
      </div>
    </article>
  );
};

export default UserChatBox;
