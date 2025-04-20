import formatCreatedDate from "@/features/chat/utils/formatCreatedDate";
import { BotChatLayoutPropsType } from "@/features/chat/components/BotChatLayout";

const BotChatHeader = ({ modelName, createdAt }: Pick<BotChatLayoutPropsType, "modelName" | "createdAt">) => {
  return (
    <div className="text-accent-foreground-70 mb-2 flex items-center gap-3">
      {modelName && <span className="font-medium">{modelName}</span>}
      {createdAt && (
        <span className="text-xs opacity-0 transition-opacity group-hover:opacity-100">
          {formatCreatedDate(createdAt)}
        </span>
      )}
    </div>
  );
};

export default BotChatHeader;
