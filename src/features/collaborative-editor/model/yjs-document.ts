import * as Y from "yjs";
import type { CardData } from "./card-types";

type CardField = "question" | "answer";

export class YjsDocument {
  private readonly doc: Y.Doc;

  readonly cards: Y.Array<Y.Map<unknown>>;

  private onUpdateCallback?: (update: Uint8Array, origin: unknown) => void;
  private onCardsChangeCallback?: (cards: CardData[]) => void;

  constructor() {
    this.doc = new Y.Doc();
    this.cards = this.doc.getArray<Y.Map<unknown>>("cards");

    this.doc.on("update", (update, origin) => {
      this.onUpdateCallback?.(update, origin);
    });
    this.cards.observe(() => {
      this.onCardsChangeCallback?.(this.getCards());
    });
  }

  onUpdate(callback: (update: Uint8Array, origin: unknown) => void): void {
    this.onUpdateCallback = callback;
  }

  onCardsChange(callback: (cards: CardData[]) => void): void {
    this.onCardsChangeCallback = callback;
  }

  applyUpdate(update: Uint8Array, origin: unknown): void {
    Y.applyUpdate(this.doc, update, origin);
  }

  getCards(): CardData[] {
    return this.cards.map((cardMap) => {
      const id = cardMap.get("id");
      const questionText = this.getCardText(cardMap, "question");
      const answerText = this.getCardText(cardMap, "answer");

      return {
        id: typeof id === "string" ? id : "",
        question: questionText?.toString() ?? "",
        answer: answerText?.toString() ?? "",
      };
    });
  }

  addCard(card: Omit<CardData, "id">): string {
    const id = crypto.randomUUID();
    const cardMap = new Y.Map<unknown>();

    cardMap.set("id", id);
    cardMap.set("question", new Y.Text(card.question));
    cardMap.set("answer", new Y.Text(card.answer));
    this.cards.push([cardMap]);

    return id;
  }

  deleteCard(index: number): void {
    if (index < 0 || index >= this.cards.length) return;

    this.cards.delete(index, 1);
  }

  updateCardQuestion(index: number, question: string): void {
    this.updateCardText(index, "question", question);
  }

  updateCardAnswer(index: number, answer: string): void {
    this.updateCardText(index, "answer", answer);
  }

  getCardQuestionText(index: number): Y.Text | null {
    return this.getCardTextByIndex(index, "question");
  }

  getCardAnswerText(index: number): Y.Text | null {
    return this.getCardTextByIndex(index, "answer");
  }

  getYDoc(): Y.Doc {
    return this.doc;
  }

  getClientId(): number {
    return this.doc.clientID;
  }

  private updateCardText(
    index: number,
    field: CardField,
    value: string,
  ): void {
    const text = this.getCardTextByIndex(index, field);
    if (!text) return;

    this.doc.transact(() => {
      text.delete(0, text.length);
      text.insert(0, value);
    });
  }

  private getCardTextByIndex(index: number, field: CardField): Y.Text | null {
    if (index < 0 || index >= this.cards.length) return null;

    return this.getCardText(this.cards.get(index), field);
  }

  private getCardText(cardMap: Y.Map<unknown>, field: CardField): Y.Text | null {
    const text = cardMap.get(field);
    return text instanceof Y.Text ? text : null;
  }
}
