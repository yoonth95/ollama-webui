import * as React from "react";
import { isMobile as isMobileDevice } from "react-device-detect";

const MOBILE_BREAKPOINT = 768; // 태블릿까지 포함하는 모바일 상한선

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);

    const determineIsMobile = () => {
      const widthBasedMobile = window.innerWidth <= MOBILE_BREAKPOINT;
      return isMobileDevice || widthBasedMobile;
    };

    const onChange = () => setIsMobile(determineIsMobile());
    setIsMobile(determineIsMobile());

    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile ?? false;
}
