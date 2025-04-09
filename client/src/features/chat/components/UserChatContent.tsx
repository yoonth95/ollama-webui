import MarkdownViewer from "@/features/markdown/MarkdownViewer";

const UserChatContent = ({ content }: { content: string }) => {
  if (!content) return null;

  return (
    <div className="max-w-[100%] px-3 sm:max-w-[90%] md:max-w-[80%]">
      <div className="dark:bg-accent bg-accent rounded-3xl rounded-tr-sm px-5 py-2 break-words">
        <MarkdownViewer content={content} />
      </div>
    </div>
  );
};

export default UserChatContent;
