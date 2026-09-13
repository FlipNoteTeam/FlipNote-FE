// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const collaborationState = vi.hoisted(() => ({
  value: {
    isConnected: false,
    hasAccess: false,
    hasSynced: false,
    connectionError: null as string | null,
    cards: [],
    awarenessStates: new Map<number, unknown>(),
    connect: vi.fn(),
    addCard: vi.fn(),
    deleteCard: vi.fn(),
    setAwareness: vi.fn(),
    getCardQuestionText: vi.fn(() => null),
    getCardAnswerText: vi.fn(() => null),
  },
}));

vi.mock("@/shared/socket/use-yjs", () => ({
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

describe("CardsetEditor 로컬 편집 모드", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    collaborationState.value = {
      isConnected: false,
      hasAccess: false,
      hasSynced: false,
      connectionError: null,
      cards: [],
      awarenessStates: new Map(),
      connect: vi.fn(),
      addCard: vi.fn(),
      deleteCard: vi.fn(),
      setAwareness: vi.fn(),
      getCardQuestionText: vi.fn(() => null),
      getCardAnswerText: vi.fn(() => null),
    };
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

  it("연결 전에도 초기 카드 한 장을 로컬에서 편집할 수 있다", async () => {
    await act(async () => {
      root.render(<CardsetEditor cardsetId="cardset-1" />);
    });

    const question = container.querySelector<HTMLTextAreaElement>("#question");
    const answer = container.querySelector<HTMLTextAreaElement>("#answer");
    if (!question || !answer) throw new Error("카드 입력 필드를 찾지 못했습니다.");

    await setTextareaValue(question, "로컬 질문");
    await setTextareaValue(answer, "로컬 답변");

    expect(question.value).toBe("로컬 질문");
    expect(answer.value).toBe("로컬 답변");
    expect(container.textContent).toContain("총 1개");
    expect(container.textContent).toContain("로컬 질문");
    expect(container.textContent).toContain("로컬 답변");
  });

  it("카드를 추가하고 삭제하되 마지막 한 장은 삭제할 수 없다", async () => {
    await act(async () => {
      root.render(<CardsetEditor cardsetId="cardset-1" />);
    });

    const addButton = container.querySelector<HTMLButtonElement>(
      'button[title="카드 추가"]',
    );
    if (!addButton) throw new Error("카드 추가 버튼을 찾지 못했습니다.");

    await click(addButton);

    expect(container.textContent).toContain("총 2개");
    const deleteButtons = container.querySelectorAll<HTMLButtonElement>(
      "button.opacity-0",
    );
    expect(deleteButtons).toHaveLength(2);

    await click(deleteButtons[1] as HTMLButtonElement);

    expect(container.textContent).toContain("총 1개");
    expect(container.querySelectorAll("button.opacity-0")).toHaveLength(0);
  });
});
