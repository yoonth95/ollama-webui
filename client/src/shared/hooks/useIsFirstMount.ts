import { useRef, useEffect } from "react";

export default function useIsFirstMount() {
  const isFirst = useRef(true);

  useEffect(() => {
    isFirst.current = false;
  }, []);

  return isFirst.current;
}
