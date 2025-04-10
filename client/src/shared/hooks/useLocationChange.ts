import { useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

/**
 * 경로 변경을 감지하는 커스텀 훅
 * @param callback 경로 변경 시 실행될 콜백 함수
 */
export const useLocationChange = (callback: (currentPath: string) => void) => {
  const location = useLocation();

  const handleLocationChange = useCallback(() => {
    callback(location.pathname);
  }, [callback, location.pathname]);

  useEffect(() => {
    handleLocationChange();
  }, [handleLocationChange]);

  return location;
};
