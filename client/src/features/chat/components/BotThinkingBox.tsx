import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/ui/accordion";
import MarkdownViewer from "@/features/markdown/MarkdownViewer";

interface BotThinkingBoxProps {
  content: string;
}

const BotThinkingBox = ({ content }: BotThinkingBoxProps) => {
  return (
    <Accordion type="single" collapsible className="mb-2 rounded-lg border px-4">
      <AccordionItem value="thinking" className="border-none">
        <AccordionTrigger className="text-muted-foreground cursor-pointer py-3 text-sm">
          생각 과정 보기
        </AccordionTrigger>
        <AccordionContent>
          <div className="text-sm italic">
            <MarkdownViewer content={content} />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default BotThinkingBox;
