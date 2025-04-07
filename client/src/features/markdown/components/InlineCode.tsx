import React from "react";

const InlineCode = ({ children }: { children: React.ReactNode }) => {
  return <code className="inline-code break-words whitespace-normal">{children}</code>;
};

export default InlineCode;
