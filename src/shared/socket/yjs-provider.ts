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
  private hasSynced = false;

  // Y.js 카드 배열
  public cardsArray: Y.Array<Y.Map<any>>;

  // 카드 변경 콜백
  private onCardsChangeCallback?: (cards: CardData[]) => void;

  // Awareness 변경 콜백
  private onAwarenessChangeCallback?: (states: Map<number, any>) => void;

  // 초기 동기화 완료 콜백
  private onSyncedCallback?: () => void;

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
      if (origin !== this && this.hasAccess && this.isConnected && this.hasSynced) {
        this.sendMessage({
          type: "update",
          data: { cardsetId: this.cardsetId, update },
        } as UpdateMessage);
      }
    });

    // 카드 배열 변경 감지
    this.cardsArray.observe(() => {
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
          Array.from(this.awareness.getStates().keys()),
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
      this.isConnected = true;
    });

    this.socket.on("disconnect", () => {
      this.isConnected = false;
      this.hasAccess = false;
    });

    // 동기화 메시지 처리 (서버가 업데이트를 브로드캐스트)
    this.socket.on("sync", (message: SyncMessage) => {
      if (!this.hasAccess) return;

      let updateBinary: Uint8Array;

      if (
        typeof message === "object" &&
        message !== null &&
        "update" in message &&
        "cardsetId" in message
      ) {
        // 새 포맷: Socket.io가 자동 파싱한 JS 객체 {cardsetId, update: ArrayBuffer | number[]}
        updateBinary = new Uint8Array(message.update);
      } else {
        // 구 포맷: Buffer → TextDecoder → JSON parse
        const jsonString = new TextDecoder().decode(message);
        const parsed = JSON.parse(jsonString);
        updateBinary = new Uint8Array(parsed.update);
      }

      console.log("증분값 적용 전, ", this.doc.getArray("cards"));

      Y.applyUpdate(this.doc, updateBinary, this);

      if (!this.hasSynced) {
        this.hasSynced = true;
        if (this.onSyncedCallback) {
          this.onSyncedCallback();
        }
      }

      console.log("증분값 적용 후, ", this.doc.getArray("cards"));
    });

    // Awareness 메시지 처리
    this.socket.on("awareness", (message: ServerAwarenessMessage) => {
      if (!this.hasAccess) return;

      // 백엔드가 { data: { cardsetId, awareness: number[] } } 형태로 전송
      const awarenessData = message?.data?.awareness ?? message?.awareness;

      if (!awarenessData) return;

      const awarenessUpdate = new Uint8Array(awarenessData);
      awarenessProtocol.applyAwarenessUpdate(
        this.awareness,
        awarenessUpdate,
        this,
      );
    });

    // 토큰 만료 처리
    this.socket.on("expired", () => {
      this.hasAccess = false;
      this.disconnect();
    });

    // 에러 처리
    this.socket.on("error", () => {});
  }

  private sendMessage({ type, data }: YjsMessage): void {
    if (this.socket?.connected) {
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

  getHasSynced(): boolean {
    return this.hasSynced;
  }

  onSynced(callback: () => void): void {
    this.onSyncedCallback = callback;
  }

  setAwareness(
    field: "question" | "answer",
    cardIndex: number,
    cursor?: { index: number; length: number },
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
