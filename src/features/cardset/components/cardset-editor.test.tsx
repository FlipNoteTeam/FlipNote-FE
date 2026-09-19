// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as Y from "yjs";
import type { CardData } from "@/features/collaborative-editor";

type MockCollaborationState = {
  isConnected: boolean;
  hasAccess: boolean;
  hasSynced: boolean;
  connectionError: string | null;
  cards: CardData[];
  awarenessStates: Map<number, unknown>;
  localClientId: number | null;
  connect: () => void;
  addCard: (card: { question: string; answer: string }) => string;
  deleteCard: (index: number) => void;
  setAwareness: (
    field: "question" | "answer",
    cardIndex: number,
  ) => void;
  getCardQuestionText: (index: number) => Y.Text | null;
  getCardAnswerText: (index: number) => Y.Text | null;
};

const collaborationState = vi.hoisted(() => ({
  value: undefined as unknown as MockCollaborationState,
}));

vi.mock("@/features/collaborative-editor", () => ({
  useYjs: () => collaborationState.value,
}));

import { CardsetEditor } from "./cardset-editor";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const setTextareaValue = async (
  textarea: HTMLTextAreaElement,
  value: string,
): Promise<void> => {
  const valueSetter = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "value",
  )?.set;

  if (!valueSetter) throw new Error("textarea value setter를 찾지 못했습니다.");

  await act(async () => {
    valueSetter.call(textarea, value);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  });
};

const click = async (element: HTMLElement): Promise<void> => {
  await act(async () => {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
};

const createConnectedState = () => {
  const document = new Y.Doc();
  const cardsArray = document.getArray<Y.Map<unknown>>("cards");
  const cards: CardData[] = [
    { id: "card-1", question: "첫 번째 질문", answer: "첫 번째 답변" },
    { id: "card-2", question: "두 번째 질문", answer: "두 번째 답변" },
  ];
  const questionTexts = cards.map((card) => new Y.Text(card.question));
  const answerTexts = cards.map((card) => new Y.Text(card.answer));

  cardsArray.push(
    cards.map((card, index) => {
      const cardMap = new Y.Map<unknown>();
      cardMap.set("id", card.id);
      cardMap.set("question", questionTexts[index]);
      cardMap.set("answer", answerTexts[index]);
      return cardMap;
    }),
  );

  return {
    state: {
      isConnected: true,
      hasAccess: true,
      hasSynced: true,
      connectionError: null,
      cards,
      awarenessStates: new Map<number, unknown>(),
      localClientId: 1,
      connect: vi.fn(),
      addCard: vi.fn(() => "new-card"),
      deleteCard: vi.fn(),
      setAwareness: vi.fn(),
      getCardQuestionText: vi.fn((index: number) => questionTexts[index] ?? null),
      getCardAnswerText: vi.fn((index: number) => answerTexts[index] ?? null),
    } satisfies MockCollaborationState,
    questionTexts,
    answerTexts,
  };
};

describe("CardsetEditor 협업 편집 모드", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("동기화된 카드의 질문과 답변을 Y.Text에 반영한다", async () => {
    const { state, questionTexts, answerTexts } = createConnectedState();
    collaborationState.value = state;

    await act(async () => {
      root.render(<CardsetEditor cardsetId="cardset-1" />);
    });

    const question = container.querySelector<HTMLTextAreaElement>("#question");
    const answer = container.querySelector<HTMLTextAreaElement>("#answer");
    if (!question || !answer) throw new Error("카드 입력 필드를 찾지 못했습니다.");

    expect(question.value).toBe("첫 번째 질문");
    expect(answer.value).toBe("첫 번째 답변");

    await setTextareaValue(question, "수정된 질문");
    await setTextareaValue(answer, "수정된 답변");

    expect(questionTexts[0]?.toString()).toBe("수정된 질문");
    expect(answerTexts[0]?.toString()).toBe("수정된 답변");
    expect(container.textContent).toContain("총 2개");
  });

  it("카드 추가와 삭제를 협업 provider에 요청한다", async () => {
    const { state } = createConnectedState();
    collaborationState.value = state;

    await act(async () => {
      root.render(<CardsetEditor cardsetId="cardset-1" />);
    });

    const addButton = container.querySelector<HTMLButtonElement>(
      'button[title="카드 추가"]',
    );
    if (!addButton) throw new Error("카드 추가 버튼을 찾지 못했습니다.");

    await click(addButton);

    expect(state.addCard).toHaveBeenCalledWith({ question: "", answer: "" });
    const deleteButtons = container.querySelectorAll<HTMLButtonElement>(
      "button.opacity-0",
    );
    expect(deleteButtons).toHaveLength(2);

    await click(deleteButtons[1] as HTMLButtonElement);

    expect(state.deleteCard).toHaveBeenCalledWith(1);
  });

  it("awareness의 사용자 이름을 현재 편집자로 표시한다", async () => {
    const { state } = createConnectedState();
    state.awarenessStates = new Map([
      [
        2,
        {
          user: { id: "user-2", name: "이이람람" },
          cardIndex: 0,
          field: "question",
        },
      ],
    ]);
    collaborationState.value = state;

    await act(async () => {
      root.render(<CardsetEditor cardsetId="cardset-1" />);
    });

    expect(container.textContent).toContain("이이람람");
  });
});
