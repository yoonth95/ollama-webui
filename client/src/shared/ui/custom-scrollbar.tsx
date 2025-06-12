import type * as React from "react";
import { cn } from "@/shared/lib/utils";

interface CustomScrollbarProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal" | "both";
  height?: string;
  width?: string;
}

export function CustomScrollbar({
  children,
  orientation = "vertical",
  width = "100%",
  className,
  ...props
}: CustomScrollbarProps) {
  return (
    <div
      className={cn(
        "themed-scrollbar relative",
        {
          "overflow-y-auto": orientation === "vertical" || orientation === "both",
          "overflow-x-auto": orientation === "horizontal" || orientation === "both",
          "overflow-hidden": orientation !== "both" && orientation !== "vertical" && orientation !== "horizontal",
        },
        className,
      )}
      style={{
        width,
        scrollbarWidth: "thin", // Firefox
        scrollbarGutter: "stable", // Modern browsers
        WebkitOverflowScrolling: "touch",
      }}
      {...props}
    >
      {children}
    </div>
  );
}
