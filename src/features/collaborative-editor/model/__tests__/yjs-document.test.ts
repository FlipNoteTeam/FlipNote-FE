import { describe, expect, it, vi } from "vitest";
import { YjsDocument } from "../yjs-document";

describe("YjsDocument", () => {
  it("카드의 질문과 답변을 Y.Text로 관리한다", () => {
    const document = new YjsDocument();
    const cardId = document.addCard({ question: "질문", answer: "답변" });

    document.updateCardQuestion(0, "수정된 질문");
    document.updateCardAnswer(0, "수정된 답변");

    expect(document.getCards()).toEqual([
      { id: cardId, question: "수정된 질문", answer: "수정된 답변" },
    ]);
    expect(document.getCardQuestionText(0)?.toString()).toBe("수정된 질문");
    expect(document.getCardAnswerText(0)?.toString()).toBe("수정된 답변");
  });

  it("카드 배열 변경을 현재 카드 snapshot으로 알린다", () => {
    const document = new YjsDocument();
    const onCardsChange = vi.fn();
    document.onCardsChange(onCardsChange);

    const firstCardId = document.addCard({ question: "첫 질문", answer: "첫 답변" });
    document.addCard({ question: "둘 질문", answer: "둘 답변" });
    document.deleteCard(0);

    expect(onCardsChange).toHaveBeenLastCalledWith([
      { id: expect.any(String), question: "둘 질문", answer: "둘 답변" },
    ]);
    expect(document.getCards()).toEqual([
      { id: expect.any(String), question: "둘 질문", answer: "둘 답변" },
    ]);
    expect(document.getCards()[0]?.id).not.toBe(firstCardId);
  });
});
