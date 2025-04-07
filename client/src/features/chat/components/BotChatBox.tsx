import MarkdownViewer from "@/features/markdown/MarkdownViewer";

const BotChatBox = ({ content }: { content: string }) => {
  return (
    <article className="bot-message flex w-full justify-start">
      <div className="max-w-[100%] px-3">
        <div className="px-5 py-2 break-words">
          <MarkdownViewer content={content} />
        </div>
      </div>
    </article>
  );
};

export default BotChatBox;
