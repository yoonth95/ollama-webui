import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";

interface TooltipContainerPropsType {
  children: React.ReactNode;
  message: string;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
}

const TooltipContainer = ({ children, message, className, side = "bottom" }: TooltipContainerPropsType) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className={className} side={side}>
          {message}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipContainer;
