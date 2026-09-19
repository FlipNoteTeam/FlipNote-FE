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

export type YjsProviderSnapshot = {
  isConnected: boolean;
  isConnecting: boolean;
  hasAccess: boolean;
  hasSynced: boolean;
  connectionError: string | null;
  cards: Card[];
  awarenessStates: Map<number, unknown>;
  localClientId: number | null;
};

const createInitialSnapshot = (
  localClientId: number | null,
): YjsProviderSnapshot => ({
  isConnected: false,
  isConnecting: false,
  hasAccess: false,
  hasSynced: false,
  connectionError: null,
  cards: [],
  awarenessStates: new Map(),
  localClientId,
});

export class YjsProvider {
  private readonly cardsetId: string;
  private readonly userId: string;

  private socket: Socket | null = null;
  private snapshot: YjsProviderSnapshot;
  private readonly snapshotListeners = new Set<() => void>();
  private pendingConnection?: {
    reject: (reason?: unknown) => void;
    cleanup: () => void;
  };

  private readonly document: YjsDocument;
  private readonly awareness: YjsAwareness;

  constructor(cardsetId: string, userId: string) {
    this.cardsetId = cardsetId;
    this.userId = userId;

    this.document = new YjsDocument();
    this.awareness = new YjsAwareness(this.document.getYDoc());
    this.snapshot = createInitialSnapshot(this.document.getClientId());

    this.setupDocumentListeners();
  }
  connect(token: string): Promise<boolean> {
    if (this.snapshot.isConnecting) return Promise.resolve(false);
    if (this.snapshot.hasAccess) return Promise.resolve(true);

    return new Promise((resolve, reject) => {
      try {
        this.updateSnapshot({ isConnecting: true, connectionError: null });
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

          this.updateSnapshot({
            isConnected: true,
            isConnecting: false,
            hasAccess: true,
          });

          resolve(true);
        };

        const handleConnectError = (error: Error) => {
          cleanup();
          this.updateSnapshot({
            isConnected: false,
            isConnecting: false,
            hasAccess: false,
            connectionError: error.message,
          });
          reject(error);
        };

        this.pendingConnection = { reject, cleanup };

        socket.once("connect", handleConnect);
        socket.once("connect_error", handleConnectError);
      } catch (error) {
        this.updateSnapshot({
          isConnected: false,
          isConnecting: false,
          hasAccess: false,
          connectionError: error instanceof Error ? error.message : "Connection failed",
        });
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
    this.updateSnapshot({
      isConnected: false,
      isConnecting: false,
      hasAccess: false,
    });
  }

  disconnect(): void {
    if (this.socket && this.snapshot.isConnected) {
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
        this.snapshot.hasAccess &&
        this.snapshot.isConnected &&
        this.snapshot.hasSynced
      ) {
        const message: UpdateMessage = {
          type: "update",
          data: { cardsetId: this.cardsetId, update },
        };
        this.sendMessage(message);
      }
    });

    this.document.onCardsChange((cards) => {
      this.updateSnapshot({ cards });
    });

    this.awareness.onChange(() => {
      if (this.snapshot.hasAccess && this.snapshot.isConnected) {
        const message: AwarenessMessage = {
          type: "awareness",
          data: {
            cardsetId: this.cardsetId,
            awareness: this.awareness.createUpdate(),
          },
        };
        this.sendMessage(message);
      }

      this.updateSnapshot({
        awarenessStates: new Map(this.awareness.getStates()),
      });
    });
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      this.updateSnapshot({ isConnected: true });
    });

    this.socket.on("disconnect", () => {
      this.updateSnapshot({ isConnected: false, hasAccess: false });
    });

    // 동기화 메시지 처리 (서버가 업데이트를 브로드캐스트)
    this.socket.on("sync", (message: SyncMessage) => {
      if (!this.snapshot.hasAccess) return;

      this.document.applyUpdate(new Uint8Array(message.update), this);

      if (!this.snapshot.hasSynced) {
        this.updateSnapshot({ hasSynced: true });
      }
    });

    // Awareness 메시지 처리
    this.socket.on("awareness", (message: ServerAwarenessMessage) => {
      if (!this.snapshot.hasAccess) return;

      const awarenessPayload = "data" in message ? message.data : message;

      this.awareness.applyUpdate(
        new Uint8Array(awarenessPayload.awareness),
        this,
      );
      this.awareness.updateUserName(
        awarenessPayload.userId,
        awarenessPayload.userName,
      );
      this.updateSnapshot({
        awarenessStates: new Map(this.awareness.getStates()),
      });
    });

    // 토큰 만료 처리
    this.socket.on("expired", () => {
      this.updateSnapshot({ hasAccess: false });
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
    if (!this.snapshot.hasAccess) return "";

    return this.document.addCard(card);
  }

  /**
   * 카드 삭제
   */
  deleteCard(index: number): void {
    if (!this.snapshot.hasAccess) return;
    this.document.deleteCard(index);
  }

  /**
   * 카드의 question 업데이트
   */
  updateCardQuestion(index: number, question: string): void {
    if (!this.snapshot.hasAccess) return;
    this.document.updateCardQuestion(index, question);
  }

  /**
   * 카드의 answer 업데이트
   */
  updateCardAnswer(index: number, answer: string): void {
    if (!this.snapshot.hasAccess) return;
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

  subscribe(listener: () => void): () => void {
    this.snapshotListeners.add(listener);
    return () => this.snapshotListeners.delete(listener);
  }

  getSnapshot(): YjsProviderSnapshot {
    return this.snapshot;
  }

  /**
   * 현재 Awareness 상태 가져오기
   */
  getAwarenessStates(): Map<number, unknown> {
    return this.snapshot.awarenessStates;
  }

  getHasAccess(): boolean {
    return this.snapshot.hasAccess;
  }

  getHasSynced(): boolean {
    return this.snapshot.hasSynced;
  }

  setAwareness(
    field: "question" | "answer",
    cardIndex: number,
    cursor?: { index: number; length: number },
  ): void {
    if (!this.snapshot.hasAccess) return;

    this.awareness.setLocalState(
      field,
      cardIndex,
      { id: this.userId, name: `User ${this.userId}` },
      cursor,
    );
  }

  private updateSnapshot(update: Partial<YjsProviderSnapshot>): void {
    this.snapshot = { ...this.snapshot, ...update };
    this.snapshotListeners.forEach((listener) => listener());
  }
}
