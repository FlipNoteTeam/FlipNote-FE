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
            this.socket?.emit("joinRoom", {
              documentId: this.documentId,
              userId: this.userId,
            });

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

    // joinRoom 응답 처리
    this.socket.on(
      "joinRoom",
      (data: { documentId: string; clientId: string; timestamp: string }) => {
        console.log("[YJS] Joined room", data);
      }
    );

    // 동기화 메시지 처리 (서버가 초기 문서 상태 전송)
    this.socket.on("sync", (data: { documentId?: string; syncStep?: number; update: number[] }) => {
      if (!this.hasAccess) return;

      console.log("[YJS❤️] Received sync from server", data);
      const { update } = data;
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
      const titleText = cardMap.get("title") as Y.Text;
      const contentText = cardMap.get("content") as Y.Text;
      const createdAt = cardMap.get("createdAt") as number;

      cards.push({
        id,
        title: titleText?.toString() || "",
        content: contentText?.toString() || "",
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
    cardMap.set("title", new Y.Text(card.title));
    cardMap.set("content", new Y.Text(card.content));
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
   * 카드의 title 업데이트
   */
  updateCardTitle(index: number, title: string): void {
    if (!this.hasAccess) return;
    if (index < 0 || index >= this.cardsArray.length) return;

    const cardMap = this.cardsArray.get(index);
    const titleText = cardMap.get("title") as Y.Text;

    if (titleText) {
      titleText.delete(0, titleText.length);
      titleText.insert(0, title);
    }
  }

  /**
   * 카드의 content 업데이트
   */
  updateCardContent(index: number, content: string): void {
    if (!this.hasAccess) return;
    if (index < 0 || index >= this.cardsArray.length) return;

    const cardMap = this.cardsArray.get(index);
    const contentText = cardMap.get("content") as Y.Text;

    if (contentText) {
      contentText.delete(0, contentText.length);
      contentText.insert(0, content);
    }
  }

  /**
   * 특정 카드의 title Y.Text 가져오기
   */
  getCardTitleText(index: number): Y.Text | null {
    if (index < 0 || index >= this.cardsArray.length) return null;

    const cardMap = this.cardsArray.get(index);
    return cardMap.get("title") as Y.Text;
  }

  /**
   * 특정 카드의 content Y.Text 가져오기
   */
  getCardContentText(index: number): Y.Text | null {
    if (index < 0 || index >= this.cardsArray.length) return null;

    const cardMap = this.cardsArray.get(index);
    return cardMap.get("content") as Y.Text;
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
    field: "title" | "content",
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
