import type { Socket } from "socket.io-client";
import { socketManager } from "@/shared/socket";
import type {
  ClientMessage,
  UpdateMessage,
  AwarenessMessage,
  LeaveCardsetMessage,
  SyncMessage,
  ServerAwarenessMessage,
} from "./socket-events";
import type { CardData as Card } from "./card-types";
import { YjsAwareness } from "./yjs-awareness";
import { YjsDocument } from "./yjs-document";

export type YjsProviderListeners = {
  onCardsChange?: (cards: Card[]) => void;
  onAwarenessChange?: (states: Map<number, unknown>) => void;
  onSynced?: () => void;
  onDisconnect?: () => void;
};

export class YjsProvider {
  private readonly cardsetId: string;
  private readonly userId: string;

  private socket: Socket | null = null;
  private isConnected = false;
  private hasAccess = false;
  private hasSynced = false;
  private pendingConnection?: {
    reject: (reason?: unknown) => void;
    cleanup: () => void;
  };

  private readonly document: YjsDocument;
  private readonly awareness: YjsAwareness;

  private listeners?: YjsProviderListeners;

  constructor(cardsetId: string, userId: string) {
    this.cardsetId = cardsetId;
    this.userId = userId;

    this.document = new YjsDocument();
    this.awareness = new YjsAwareness(this.document.getYDoc());

    this.setupDocumentListeners();
  }
  connect(token: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = socketManager.connect(token);

        const socket = this.socket;
        const cleanup = () => {
          socket.off("connect", handleConnect);
          socket.off("connect_error", handleConnectError);
          if (this.pendingConnection?.cleanup === cleanup) {
            this.pendingConnection = undefined;
          }
        };

        const handleConnect = () => {
          cleanup();

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
        };

        const handleConnectError = (error: Error) => {
          cleanup();
          reject(error);
        };

        this.pendingConnection = { reject, cleanup };

        socket.once("connect", handleConnect);
        socket.once("connect_error", handleConnectError);
      } catch (error) {
        reject(error);
      }
    });
  }

  cancelConnection(): void {
    if (!this.pendingConnection) return;

    const { cleanup, reject } = this.pendingConnection;
    cleanup();
    reject(new Error("Connection cancelled"));

    this.closeSocket();
  }

  private closeSocket(): void {
    if (this.socket) {
      socketManager.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.hasAccess = false;
  }

  disconnect(): void {
    if (this.socket && this.isConnected) {
      // 카드셋에서 나가기
      const message: LeaveCardsetMessage = {
        type: "leave-cardset",
        data: {
          cardsetId: this.cardsetId,
        },
      };
      this.sendMessage(message);
    }

    if (this.pendingConnection) {
      this.cancelConnection();
      return;
    }

    this.closeSocket();
  }

  private setupDocumentListeners(): void {
    this.document.onUpdate((update, origin) => {
      if (
        origin !== this &&
        this.hasAccess &&
        this.isConnected &&
        this.hasSynced
      ) {
        const message: UpdateMessage = {
          type: "update",
          data: { cardsetId: this.cardsetId, update },
        };
        this.sendMessage(message);
      }
    });

    this.document.onCardsChange((cards) => {
      this.listeners?.onCardsChange?.(cards);
    });

    this.awareness.onChange(() => {
      if (this.hasAccess && this.isConnected) {
        const message: AwarenessMessage = {
          type: "awareness",
          data: {
            cardsetId: this.cardsetId,
            awareness: this.awareness.createUpdate(),
          },
        };
        this.sendMessage(message);
      }

      this.listeners?.onAwarenessChange?.(this.getAwarenessStates());
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
      this.listeners?.onDisconnect?.();
    });

    // 동기화 메시지 처리 (서버가 업데이트를 브로드캐스트)
    this.socket.on("sync", (message: SyncMessage) => {
      if (!this.hasAccess) return;

      this.document.applyUpdate(new Uint8Array(message.update), this);

      if (!this.hasSynced) {
        this.hasSynced = true;
        this.listeners?.onSynced?.();
      }
    });

    // Awareness 메시지 처리
    this.socket.on("awareness", (message: ServerAwarenessMessage) => {
      if (!this.hasAccess) return;

      // 백엔드가 { data: { cardsetId, awareness: number[] } } 형태로 전송
      const awarenessData =
        "data" in message ? message.data.awareness : message.awareness;

      this.awareness.applyUpdate(new Uint8Array(awarenessData), this);
    });

    // 토큰 만료 처리
    this.socket.on("expired", () => {
      this.hasAccess = false;
      this.disconnect();
    });

    //@TODO http handshake과정에서 401 발생 시 토큰 재발급 시도 필요
    // 에러 처리
    this.socket.on("error", () => {});
  }

  private sendMessage({ type, data }: ClientMessage): void {
    if (this.socket?.connected) {
      this.socket.emit(type, data);
    }
  }

  // 카드 관련 메서드들

  /**
   * 카드 배열을 CardData[]로 변환
   */
  getCards(): Card[] {
    return this.document.getCards();
  }

  /**
   * 새 카드 추가
   */
  addCard(card: Omit<Card, "id">): string {
    if (!this.hasAccess) return "";

    return this.document.addCard(card);
  }

  /**
   * 카드 삭제
   */
  deleteCard(index: number): void {
    if (!this.hasAccess) return;
    this.document.deleteCard(index);
  }

  /**
   * 카드의 question 업데이트
   */
  updateCardQuestion(index: number, question: string): void {
    if (!this.hasAccess) return;
    this.document.updateCardQuestion(index, question);
  }

  /**
   * 카드의 answer 업데이트
   */
  updateCardAnswer(index: number, answer: string): void {
    if (!this.hasAccess) return;
    this.document.updateCardAnswer(index, answer);
  }

  /**
   * 특정 카드의 question Y.Text 가져오기
   */
  getCardQuestionText(index: number) {
    return this.document.getCardQuestionText(index);
  }

  /**
   * 특정 카드의 answer Y.Text 가져오기
   */
  getCardAnswerText(index: number) {
    return this.document.getCardAnswerText(index);
  }

  subscribe(listeners: YjsProviderListeners): () => void {
    this.listeners = listeners;

    return () => {
      if (this.listeners === listeners) {
        this.listeners = undefined;
      }
    };
  }

  /**
   * 현재 Awareness 상태 가져오기
   */
  getAwarenessStates(): Map<number, unknown> {
    return this.awareness.getStates();
  }

  getHasAccess(): boolean {
    return this.hasAccess;
  }

  getHasSynced(): boolean {
    return this.hasSynced;
  }

  setAwareness(
    field: "question" | "answer",
    cardIndex: number,
    cursor?: { index: number; length: number },
  ): void {
    if (!this.hasAccess) return;

    this.awareness.setLocalState(
      field,
      cardIndex,
      { id: this.userId, name: `User ${this.userId}` },
      cursor,
    );
  }
}
