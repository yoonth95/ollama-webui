import { Editor, Extension } from "@tiptap/core";

// 빈 문단 추가
const insertParagraphAtStart = (editor: Editor) => {
  editor.commands.insertContentAt(0, { type: "paragraph", content: [] });
  editor.commands.focus("start");
  return true;
};

type ResolvedPos = {
  depth: number;
  index: (depth: number) => number;
};

// 첫 번째 노드인지 확인인
const isFirstNode = ($from: ResolvedPos) => $from.depth === 1 && $from.index($from.depth - 1) === 0;

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
        if (isInCodeBlock && isAtStart && isFirstNode($from)) {
          return insertParagraphAtStart(editor);
        }

        return false;
      },
    };
  },
});

const HorizontalRuleEnhancementExtension = Extension.create({
  name: "horizontalRuleEnhancement",
  addKeyboardShortcuts() {
    return {
      ArrowUp: ({ editor }) => {
        // 현재 선택 위치 확인
        const { selection } = editor.state;
        const { $from } = selection;

        // HR 요소가 제일 위에 있는 경우 paragraph 추가
        const isAtHr = $from.node(-1)?.firstChild?.type.name === "horizontalRule";
        if (isAtHr) {
          return insertParagraphAtStart(editor);
        }

        return false;
      },
    };
  },
});

export { ShiftEnterExtension, CodeBlockEnhancementExtension, HorizontalRuleEnhancementExtension };
