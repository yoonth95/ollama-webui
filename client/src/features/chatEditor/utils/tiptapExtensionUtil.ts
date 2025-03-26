import { Extension } from "@tiptap/core";

const ShiftEnterExtension = Extension.create({
  name: "shiftEnter",
  addKeyboardShortcuts() {
    return {
      "Shift-Enter": ({ editor }) => {
        editor.commands.first(({ commands }) => [
          () => commands.newlineInCode(),
          () => commands.splitListItem("listItem"),
          () => commands.createParagraphNear(),
          () => commands.liftEmptyBlock(),
          () => commands.splitBlock(),
        ]);
        return true;
      },
    };
  },
});

const CodeBlockEnhancementExtension = Extension.create({
  name: "codeBlockEnhance",
  addKeyboardShortcuts() {
    return {
      ArrowUp: ({ editor }) => {
        // 현재 선택 위치 확인
        const { selection } = editor.state;
        const { $from, from } = selection;

        // 현재 위치가 코드 블록 내부이고, 코드 블록의 맨 앞부분인지 확인
        const isInCodeBlock = $from.parent.type.name === "codeBlock";
        const isAtStart = from === $from.start();

        // 코드 블록의 맨 앞부분이고, 이 코드 블록이 문서의 첫 번째 노드인 경우
        if (isInCodeBlock && isAtStart && $from.depth === 1 && $from.index($from.depth - 1) === 0) {
          editor.commands.insertContentAt(0, { type: "paragraph", content: [] }); // 빈 문단 추가 (placeholder 비활성화)
          editor.commands.focus("start"); // 새로 추가된 문단으로 커서 이동
          return true;
        }

        return false;
      },
    };
  },
});

export { ShiftEnterExtension, CodeBlockEnhancementExtension };
