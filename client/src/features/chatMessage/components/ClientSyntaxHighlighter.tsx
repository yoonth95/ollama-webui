import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import vscDarkPlus from "react-syntax-highlighter/dist/cjs/styles/prism/vsc-dark-plus";

interface ClientSyntaxHighlighterPropsType {
  language: string;
  codeContent: string;
  className?: string;
}
const ClientSyntaxHighlighter = ({ language, codeContent, className = "" }: ClientSyntaxHighlighterPropsType) => {
  return (
    <SyntaxHighlighter language={language} PreTag="div" style={vscDarkPlus} className={`!my-0 ${className}`}>
      {codeContent}
    </SyntaxHighlighter>
  );
};

export default ClientSyntaxHighlighter;
