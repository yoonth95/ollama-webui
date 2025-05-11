import { useEffect, useRef, useState } from "react";

export const useScrollToBottom = (chatRoomId: string) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isBottom, setIsBottom] = useState(false);

  const scrollToBottomSmooth = () => {
    containerRef.current?.scrollTo({ behavior: "smooth", top: containerRef.current.scrollHeight });
  };

  const scrollToBottomInstant = () => {
    // DOM 업데이트 후 브라우저 화면에 그리기 직전에 실행
    requestAnimationFrame(() => {
      containerRef.current?.scrollTo({ behavior: "auto", top: containerRef.current.scrollHeight });
    });
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    setIsBottom(
      containerRef.current.scrollHeight - containerRef.current.scrollTop === containerRef.current.clientHeight,
    );
  };

  // 스크롤 맨 밑인지 감지
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [chatRoomId]);

  return {
    containerRef,
    isBottom,
    scrollToBottomSmooth,
    scrollToBottomInstant,
  };
};
