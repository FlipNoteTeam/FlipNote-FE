/* eslint-disable */
// @ts-nocheck

/** @TODO: yjs쪽 타입 제대로 지정 */
import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import { Socket } from "socket.io-client";
import { socketManager } from "./index";
import type {
  YjsMessage,
  UpdateMessage,
  AwarenessMessage,
  LeaveCardsetMessage,
  SyncMessage,
  ServerAwarenessMessage,
} from "./yjs-types";
import type { CardData } from "./card-types";

import * as awarenessProtocol from "y-protocols/awareness";

export class YjsProvider {
  private doc: Y.Doc;
  private awareness: Awareness;
  private socket: Socket | null = null;
  private isConnected = false;
  private cardsetId: string;
  private userId: string;
  private hasAccess = false;

  // Y.js 카드 배열
  public cardsArray: Y.Array<Y.Map<any>>;

  // 카드 변경 콜백
  private onCardsChangeCallback?: (cards: CardData[]) => void;

  // Awareness 변경 콜백
  private onAwarenessChangeCallback?: (states: Map<number, any>) => void;

  constructor(cardsetId: string, userId: string) {
    this.cardsetId = cardsetId;
    this.userId = userId;

    this.doc = new Y.Doc();
    this.awareness = new Awareness(this.doc);

    // 카드 배열 생성
    this.cardsArray = this.doc.getArray("cards");

    this.setupDocumentListeners();
    this.setupAwarenessListeners();
  }
  connect(token: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = socketManager.connect(token);

        this.socket.once("connect", () => {
          console.log("[socket] connected");

          // 소켓 이벤트 리스너 등록 — 반드시 connect 이후에
          this.setupSocketListeners();

          // auth 전송
          this.sendMessage({
            type: "auth",
            data: {
              token,
              userId: this.userId,
              cardsetId: this.cardsetId,
            },
          });

          // 🔥 반드시 추가해야 하는 코드
          this.sendMessage({
            type: "join-cardset",
            data: {
              cardsetId: this.cardsetId,
            },
          });

          this.isConnected = true;
          this.hasAccess = true; // access-control 제거했으면 필요

          resolve(true);
        });

        this.socket.once("connect_error", reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      // 카드셋에서 나가기
      this.sendMessage({
        type: "leave-cardset",
        data: {
          cardsetId: this.cardsetId,
        },
      } as LeaveCardsetMessage);

      socketManager.disconnect();
      this.socket = null;
    }

    this.isConnected = false;
    this.hasAccess = false;
  }

  private setupDocumentListeners(): void {
    // 문서 업데이트 시 다른 클라이언트에게 전송
    this.doc.on("update", (update: Uint8Array, origin: any) => {
      console.log("[YJS] Doc update", {
        origin,
      });

      if (origin !== this && this.hasAccess && this.isConnected) {
        console.log("[YJS] Sending update to server");
        this.sendMessage({
          type: "update",
          data: { cardsetId: this.cardsetId, update },
        } as UpdateMessage);
      }
    });

    // 카드 배열 변경 감지
    this.cardsArray.observe(() => {
      console.log("[YJS] Cards array changed");
      if (this.onCardsChangeCallback) {
        this.onCardsChangeCallback(this.getCards());
      }
    });
  }

  private setupAwarenessListeners(): void {
    // Awareness 변경 시 다른 클라이언트에게 전송
    this.awareness.on("change", () => {
      if (this.hasAccess && this.isConnected) {
        const awarenessUpdate = awarenessProtocol.encodeAwarenessUpdate(
          this.awareness,
          Array.from(this.awareness.getStates().keys())
        );

        this.sendMessage({
          type: "awareness",
          data: {
            cardsetId: this.cardsetId,
            awareness: awarenessUpdate,
          },
        } as AwarenessMessage);
      }

      // Awareness 콜백 호출
      if (this.onAwarenessChangeCallback) {
        this.onAwarenessChangeCallback(this.awareness.getStates());
      }
    });
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("[EVENT] connect");
      this.isConnected = true;
    });

    this.socket.on("disconnect", (reason: string) => {
      console.log("[EVENT] disconnect / reason:", reason);
      this.isConnected = false;
      this.hasAccess = false;
    });

    // join-cardset 응답 처리 — 나중에 접속한 유저의 초기 상태 동기화
    this.socket.on(
      "cardset-state",
      (data: { cardsetId: string; cards: any[] }) => {
        console.log("[EVENT] cardset-state");
        console.log("[CARDSET-STATE] data:", data);

        // cardsArray가 비어있을 때만 초기화 (이미 sync로 데이터를 받은 경우 스킵)
        if (data.cards?.length > 0 && this.cardsArray.length === 0) {
          console.log("[CARDSET-STATE] Initializing Y.Doc from cardset-state");
          this.doc.transact(() => {
            data.cards.forEach((card) => {
              const cardMap = new Y.Map();
              cardMap.set("id", card.id);
              cardMap.set("question", new Y.Text(card.question || ""));
              cardMap.set("answer", new Y.Text(card.answer || ""));
              this.cardsArray.push([cardMap]);
            });
          }, this);
        }
      }
    );

    // 동기화 메시지 처리 (서버가 업데이트를 브로드캐스트)
    this.socket.on("sync", (message: SyncMessage) => {
      if (!this.hasAccess) return;

      console.log("[EVENT] sync");
      console.log("[SYNC] raw message type:", typeof message, message instanceof ArrayBuffer ? "ArrayBuffer" : message instanceof Uint8Array ? "Uint8Array" : Array.isArray(message) ? "Array" : "other");
      console.log("[SYNC] raw message:", message);

      let cardsetId: string;
      let updateBinary: Uint8Array;

      if (
        typeof message === "object" &&
        message !== null &&
        "update" in message &&
        "cardsetId" in message
      ) {
        // 새 포맷: Socket.io가 자동 파싱한 JS 객체 {cardsetId, update: ArrayBuffer | number[]}
        cardsetId = message.cardsetId;
        updateBinary = new Uint8Array(message.update);
        console.log("[SYNC] new format - cardsetId:", cardsetId, "/ update:", updateBinary);
      } else {
        // 구 포맷: Buffer → TextDecoder → JSON parse
        const jsonString = new TextDecoder().decode(message);
        const parsed = JSON.parse(jsonString);
        cardsetId = parsed.cardsetId;
        updateBinary = new Uint8Array(parsed.update);
        console.log("[SYNC] legacy format - cardsetId:", cardsetId, "/ update:", updateBinary);
      }

      Y.applyUpdate(this.doc, updateBinary, this);

      // applyUpdate 후 cardsArray 상태 확인
      console.log("[SYNC] cardsArray.length after applyUpdate:", this.cardsArray.length);
      this.cardsArray.forEach((item, index) => {
        console.log(`[SYNC] cardsArray[${index}] type:`, item?.constructor?.name, "/ instanceof Y.Map:", item instanceof Y.Map, "/ value:", item);
        if (item instanceof Y.Map) {
          console.log(`[SYNC] cardsArray[${index}] keys:`, Array.from(item.keys()));
          console.log(`[SYNC] cardsArray[${index}].get('id'):`, item.get("id"), typeof item.get("id"));
          console.log(`[SYNC] cardsArray[${index}].get('question'):`, item.get("question"), "instanceof Y.Text:", item.get("question") instanceof Y.Text);
          console.log(`[SYNC] cardsArray[${index}].get('answer'):`, item.get("answer"), "instanceof Y.Text:", item.get("answer") instanceof Y.Text);
        } else {
          console.log(`[SYNC] cardsArray[${index}] plain value:`, JSON.stringify(item));
        }
      });
    });

    // Awareness 메시지 처리
    this.socket.on("awareness", (message: ServerAwarenessMessage) => {
      if (!this.hasAccess) return;

      console.log("[EVENT] awareness");
      console.log("[AWARENESS] raw type:", typeof message, "/ value:", message);

      // 백엔드가 { data: { cardsetId, awareness: number[] } } 형태로 전송
      const awarenessData = message?.data?.awareness ?? message?.awareness;
      console.log("[AWARENESS] awareness field:", awarenessData);

      if (!awarenessData) return;

      const awarenessUpdate = new Uint8Array(awarenessData);
      awarenessProtocol.applyAwarenessUpdate(this.awareness, awarenessUpdate, this);
    });

    // 토큰 만료 처리
    this.socket.on("expired", () => {
      console.log("[EVENT] expired");
      this.hasAccess = false;
      this.disconnect();
    });

    // 에러 처리
    this.socket.on("error", (message: any) => {
      console.log("[EVENT] error");
      console.log("[ERROR] raw type:", typeof message, "/ value:", message);
      try {
        const decoded = new TextDecoder().decode(message);
        console.log("[ERROR] decoded:", JSON.parse(decoded));
      } catch {
        console.log("[ERROR] could not decode as JSON");
      }
    });
  }

  private sendMessage({ type, data }: YjsMessage): void {
    if (this.socket?.connected) {
      console.log("[EMIT]", type, "/ data:", data);
      this.socket.emit(type, data);
    }
  }

  // 카드 관련 메서드들

  /**
   * 카드 배열을 CardData[]로 변환
   */
  getCards(): CardData[] {
    const cards: CardData[] = [];

    this.cardsArray.forEach((cardMap) => {
      const id = cardMap.get("id") as string;
      const questionText = cardMap.get("question") as Y.Text;
      const answerText = cardMap.get("answer") as Y.Text;

      cards.push({
        id,
        question: questionText?.toString() || "",
        answer: answerText?.toString() || "",
      });
    });

    return cards;
  }

  /**
   * 새 카드 추가
   */
  addCard(card: Omit<CardData, "id">): string {
    if (!this.hasAccess) return "";

    const id = crypto.randomUUID();

    const cardMap = new Y.Map();

    cardMap.set("id", id);
    cardMap.set("question", new Y.Text(card.question));
    cardMap.set("answer", new Y.Text(card.answer));

    this.cardsArray.push([cardMap]);

    return id;
  }

  /**
   * 카드 삭제
   */
  deleteCard(index: number): void {
    if (!this.hasAccess) return;
    if (index < 0 || index >= this.cardsArray.length) return;

    this.cardsArray.delete(index, 1);
  }

  /**
   * 카드의 question 업데이트
   */
  updateCardQuestion(index: number, question: string): void {
    if (!this.hasAccess) return;
    if (index < 0 || index >= this.cardsArray.length) return;

    const cardMap = this.cardsArray.get(index);
    const questionText = cardMap.get("question") as Y.Text;

    if (questionText) {
      questionText.delete(0, questionText.length);
      questionText.insert(0, question);
    }
  }

  /**
   * 카드의 answer 업데이트
   */
  updateCardAnswer(index: number, answer: string): void {
    if (!this.hasAccess) return;
    if (index < 0 || index >= this.cardsArray.length) return;

    const cardMap = this.cardsArray.get(index);
    const answerText = cardMap.get("answer") as Y.Text;

    if (answerText) {
      answerText.delete(0, answerText.length);
      answerText.insert(0, answer);
    }
  }

  /**
   * 특정 카드의 question Y.Text 가져오기
   */
  getCardQuestionText(index: number): Y.Text | null {
    if (index < 0 || index >= this.cardsArray.length) return null;

    const cardMap = this.cardsArray.get(index);
    return cardMap.get("question") as Y.Text;
  }

  /**
   * 특정 카드의 answer Y.Text 가져오기
   */
  getCardAnswerText(index: number): Y.Text | null {
    if (index < 0 || index >= this.cardsArray.length) return null;

    const cardMap = this.cardsArray.get(index);
    return cardMap.get("answer") as Y.Text;
  }

  /**
   * 카드 변경 리스너 등록
   */
  onCardsChange(callback: (cards: CardData[]) => void): void {
    this.onCardsChangeCallback = callback;
  }

  /**
   * Awareness 변경 리스너 등록
   */
  onAwarenessChange(callback: (states: Map<number, any>) => void): void {
    this.onAwarenessChangeCallback = callback;
  }

  /**
   * 현재 Awareness 상태 가져오기
   */
  getAwarenessStates(): Map<number, any> {
    return this.awareness.getStates();
  }

  getHasAccess(): boolean {
    return this.hasAccess;
  }

  setAwareness(
    field: "question" | "answer",
    cardIndex: number,
    cursor?: { index: number; length: number }
  ): void {
    if (!this.hasAccess) return;

    this.awareness.setLocalStateField("field", field);
    this.awareness.setLocalStateField("cardIndex", cardIndex);
    if (cursor) {
      this.awareness.setLocalStateField("cursor", cursor);
    }
    this.awareness.setLocalStateField("user", {
      id: this.userId,
      name: `User ${this.userId}`,
    });
  }
}
