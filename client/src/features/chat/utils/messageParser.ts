interface ParsedMessage {
  thinkContent: string | null;
  mainContent: string;
}

export const parseMessage = (content: string): ParsedMessage => {
  const hasThinkTag = content.includes("<think>");

  if (!hasThinkTag) {
    return {
      thinkContent: null,
      mainContent: content,
    };
  }

  const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
  const thinkContent = thinkMatch ? thinkMatch[1].trim() : null;
  const mainContent = content.replace(/<think>[\s\S]*?<\/think>/, "").trim();

  return {
    thinkContent,
    mainContent,
  };
};
