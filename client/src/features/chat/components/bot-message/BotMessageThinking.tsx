import MarkdownViewer from "@/features/markdown/MarkdownViewer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/ui/accordion";

interface BotMessageThinkingProps {
  content: string;
}

const BotMessageThinking = ({ content }: BotMessageThinkingProps) => {
  return (
    <Accordion type="single" collapsible className="mb-2 rounded-lg border px-4">
      <AccordionItem value="thinking" className="border-none">
        <AccordionTrigger className="text-muted-foreground cursor-pointer py-3 text-sm">
          생각 과정 보기
        </AccordionTrigger>
        <AccordionContent>
          <div className="text-sm italic">
            <MarkdownViewer content={content.replace(/<\/?think>/g, "")} />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default BotMessageThinking;
