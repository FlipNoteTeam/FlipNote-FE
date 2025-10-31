import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import { Socket } from "socket.io-client";
import { socketManager } from "./index";
import type {
  YjsMessage,
  UpdateMessage,
  AwarenessMessage,
  AuthMessage,
  AccessControlMessage,
  JoinCardsetMessage,
  LeaveCardsetMessage,
  SyncMessage,
} from "./yjs-types";
import type { CardData } from "./card-types";

import * as awarenessProtocol from "y-protocols/awareness";

export class YjsProvider {
  private doc: Y.Doc;
  private awareness: Awareness;
  private socket: Socket | null = null;
  private isConnected = false;
  private documentId: string;
  private userId: string;
  private hasAccess = false;

  // Y.js 카드 배열
  public cardsArray: Y.Array<Y.Map<any>>;

  // 카드 변경 콜백
  private onCardsChangeCallback?: (cards: CardData[]) => void;

  constructor(documentId: string, userId: string) {
    this.documentId = documentId;
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
        this.setupSocketListeners();

        // 인증 메시지 전송
        this.sendMessage({
          type: "auth",
          data: {
            token,
            userId: this.userId,
            documentId: this.documentId,
          },
        } as AuthMessage);

        // 접근 권한 응답 대기
        this.socket.once("access-control", (message: AccessControlMessage) => {
          this.hasAccess = message.data.hasAccess;
          if (this.hasAccess) {
            this.isConnected = true;

            // 룸에 조인
            this.sendMessage({
              type: "join-cardset",
              data: {
                cardsetId: this.documentId,
              },
            } as JoinCardsetMessage);

            resolve(true);
          } else {
            reject(new Error(message.data.message));
          }
        });
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
          cardsetId: this.documentId,
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
        originIsThis: origin === this,
        hasAccess: this.hasAccess,
        isConnected: this.isConnected,
      });

      if (origin !== this && this.hasAccess && this.isConnected) {
        console.log("[YJS] Sending update to server");
        this.sendMessage({
          type: "update",
          data: { documentId: this.documentId, update: Array.from(update) },
        } as unknown as UpdateMessage);
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
            documentId: this.documentId,
            awareness: Array.from(awarenessUpdate),
          },
        } as unknown as AwarenessMessage);
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

    // join-cardset 응답 처리
    this.socket.on(
      "cardset-state",
      (data: { cardsetId: string; cards: any[] }) => {
        console.log("[YJS] Received cardset state", data);
        // 서버에서 보낸 초기 상태는 무시 (Yjs sync로 받을 것)
      }
    );

    // 동기화 메시지 처리 (서버가 업데이트를 브로드캐스트)
    this.socket.on("sync", (message: SyncMessage) => {
      if (!this.hasAccess) return;

      console.log("[YJS❤️] Received sync from server", message);
      const { update } = message.data;
      Y.applyUpdate(this.doc, new Uint8Array(update), this);
    });

    // Awareness 메시지 처리
    this.socket.on("awareness", (message: AwarenessMessage) => {
      if (!this.hasAccess) return;

      const { awareness } = message.data;
      awarenessProtocol.applyAwarenessUpdate(
        this.awareness,
        new Uint8Array(awareness),
        this
      );
    });

    // 토큰 만료 처리
    this.socket.on("expired", () => {
      this.hasAccess = false;
      this.disconnect();
    });

    // 접근 권한 변경 처리
    this.socket.on("access-control", (message: AccessControlMessage) => {
      this.hasAccess = message.data.hasAccess;
      if (!this.hasAccess) {
        this.disconnect();
      }
    });
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
      const createdAt = cardMap.get("createdAt") as number;

      cards.push({
        id,
        question: questionText?.toString() || "",
        answer: answerText?.toString() || "",
        createdAt,
      });
    });

    return cards;
  }

  /**
   * 새 카드 추가
   */
  addCard(card: Omit<CardData, "id" | "createdAt">): string {
    if (!this.hasAccess) return "";

    const id = `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = Date.now();

    const cardMap = new Y.Map();
    cardMap.set("id", id);
    cardMap.set("question", new Y.Text(card.question));
    cardMap.set("answer", new Y.Text(card.answer));
    cardMap.set("createdAt", createdAt);

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
