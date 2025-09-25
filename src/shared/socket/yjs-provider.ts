import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import { Socket } from "socket.io-client";
import { socketManager } from "./index";
import type {
  YjsMessage,
  SyncMessage,
  UpdateMessage,
  AwarenessMessage,
  AuthMessage,
  AccessControlMessage,
} from "./yjs-types";

import * as awarenessProtocol from "y-protocols/awareness";

export class YjsProvider {
  private doc: Y.Doc;
  private awareness: Awareness;
  private socket: Socket | null = null;
  private isConnected = false;
  private documentId: string;
  private userId: string;
  private hasAccess = false;

  // Y.js 텍스트 타입들
  public questionText: Y.Text;
  public answerText: Y.Text;

  constructor(documentId: string, userId: string) {
    this.documentId = documentId;
    this.userId = userId;

    this.doc = new Y.Doc();
    this.awareness = new Awareness(this.doc);

    // 질문/답변 텍스트 생성
    this.questionText = this.doc.getText("question");
    this.answerText = this.doc.getText("answer");

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
      if (origin !== this && this.hasAccess && this.isConnected) {
        this.sendMessage({
          type: "update",
          data: { update: Array.from(update) },
        } as unknown as UpdateMessage);
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
          data: { awareness: Array.from(awarenessUpdate) },
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

    // 동기화 메시지 처리
    this.socket.on("sync", (message: SyncMessage) => {
      if (!this.hasAccess) return;

      const { syncStep, update } = message.data;

      if (syncStep === 0) {
        // Step 0: 클라이언트가 현재 상태 벡터 전송
        const stateVector = Y.encodeStateVector(this.doc);
        this.sendMessage({
          type: "sync",
          data: { syncStep: 1, update: Array.from(stateVector) },
        } as unknown as SyncMessage);
      } else if (syncStep === 1 && update) {
        // Step 1: 서버가 차이점 전송
        Y.applyUpdate(this.doc, new Uint8Array(update), this);
      }
    });

    // 업데이트 메시지 처리
    this.socket.on("update", (message: UpdateMessage) => {
      if (!this.hasAccess) return;

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

  private sendMessage(message: YjsMessage): void {
    if (this.socket?.connected) {
      this.socket.emit("yjs-message", message);
    }
  }


  // 편의 메서드들
  setQuestionText(text: string): void {
    if (!this.hasAccess) return;

    this.questionText.delete(0, this.questionText.length);
    this.questionText.insert(0, text);
  }

  setAnswerText(text: string): void {
    if (!this.hasAccess) return;

    this.answerText.delete(0, this.answerText.length);
    this.answerText.insert(0, text);
  }

  getQuestionText(): string {
    return this.questionText.toString();
  }

  getAnswerText(): string {
    return this.answerText.toString();
  }

  getHasAccess(): boolean {
    return this.hasAccess;
  }

  setAwareness(
    field: "question" | "answer",
    cursor?: { index: number; length: number }
  ): void {
    if (!this.hasAccess) return;

    this.awareness.setLocalStateField("field", field);
    if (cursor) {
      this.awareness.setLocalStateField("cursor", cursor);
    }
    this.awareness.setLocalStateField("user", {
      id: this.userId,
      name: `User ${this.userId}`,
    });
  }
}
