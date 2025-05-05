import { useCallback, useRef } from 'react';

/**
 * 함수 호출을 디바운스하는 커스텀 훅
 * @param delay 디바운스 딜레이(ms)
 * @returns 디바운스된 함수를 반환하는 콜백 함수
 */
const useDebounce = () => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const debounce = useCallback((fn: () => void, delay: number) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    timerRef.current = setTimeout(() => {
      fn();
    }, delay);
  }, []);

  return debounce;
};

export default useDebounce;
