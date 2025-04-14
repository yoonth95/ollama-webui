import { useState, useEffect } from "react";

const useThinkContent = (content: string) => {
  const [thinkContent, setThinkContent] = useState(""); // 생각 과정 내용
  const [mainContent, setMainContent] = useState(""); // 본문 내용
  const [isThinking, setIsThinking] = useState(false); // 생각 과정 진행 여부

  useEffect(() => {
    const thinkStartIndex = content.indexOf("<think>");
    const thinkEndIndex = content.indexOf("</think>");

    if (thinkStartIndex !== -1) {
      setIsThinking(true);

      if (thinkEndIndex !== -1) {
        const thinkText = content.substring(thinkStartIndex + 7, thinkEndIndex).trim();
        setThinkContent(thinkText);
        setMainContent(content.substring(thinkEndIndex + 8).trim());

        if (!thinkText) {
          setIsThinking(false);
        }
      } else {
        const thinkText = content.substring(thinkStartIndex + 7).trim();
        setThinkContent(thinkText);
        setMainContent("");
      }
    } else {
      setIsThinking(false);
      setThinkContent("");
      setMainContent(content.trim());
    }
  }, [content]);

  return { thinkContent, mainContent, isThinking };
};

export default useThinkContent;
