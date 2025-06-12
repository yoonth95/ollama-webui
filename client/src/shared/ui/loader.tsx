import { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";
import { LoaderCircle } from "lucide-react";

export type LoaderVariant = "div" | "table-row";

export interface LoaderProps extends HTMLAttributes<HTMLElement> {
  /**
   * 로더를 위한 참조 객체
   */
  loaderRef?: (node?: Element | null) => void;
  /**
   * 로더의 변형 (div 또는 table-row)
   * @default "div"
   */
  variant?: LoaderVariant;
  /**
   * 로더의 크기
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * 테이블 행 변형에서 사용할 colSpan 값
   * @default 3
   */
  colSpan?: number;
}

/**
 * 다양한 컨텍스트에서 사용할 수 있는 로딩 애니메이션 컴포넌트
 * div 형태(일반 컨테이너)와 table-row 형태(테이블 내부)를 지원
 */
const Loader = ({ loaderRef, variant = "div", size = "md", colSpan = 3, className, ...props }: LoaderProps) => {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const loaderIconClasses = cn(sizeMap[size], "animate-spin", variant === "table-row" && "mx-auto");

  if (variant === "table-row") {
    return (
      <tr ref={loaderRef} className={cn("text-muted-foreground text-center", className)} {...props}>
        <td colSpan={colSpan} className="py-2">
          <LoaderCircle className={loaderIconClasses} />
        </td>
      </tr>
    );
  }

  return (
    <div
      ref={loaderRef}
      className={cn("text-muted-foreground flex min-h-9 items-center justify-center text-sm", className)}
      {...props}
    >
      <LoaderCircle className={loaderIconClasses} />
    </div>
  );
};

export default Loader;
