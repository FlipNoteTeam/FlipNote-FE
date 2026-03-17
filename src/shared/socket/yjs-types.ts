/* eslint-disable */
// @ts-nocheck

/** @TODO: yjs쪽 타입 제대로 지정 */
// Client → Server 이벤트 타입
export type ClientEventType =
  | "auth"
  | "join-cardset"
  | "leave-cardset"
  | "update"
  | "awareness";

// Server → Client 이벤트 타입
export type ServerEventType =
  | "access-control"
  | "cardset-state"
  | "sync"
  | "awareness"
  | "expired";

export interface YjsMessage {
  type: ClientEventType | ServerEventType;
  data?: unknown;
}

// Server → Client: 동기화 메시지 (서버가 업데이트를 브로드캐스트)
export interface SyncMessage extends YjsMessage {
  type: "sync";
  data: {
    documentId?: string;
    syncStep?: number;
    update: Uint8Array;
  };
}

// Client → Server: Yjs 업데이트 전송
export interface UpdateMessage extends YjsMessage {
  type: "update";
  data: {
    documentId: string;
    update: Uint8Array;
  };
}

// 양방향: Awareness (커서 위치 등)
export interface AwarenessMessage extends YjsMessage {
  type: "awareness";
  data: {
    documentId: string;
    awareness: Uint8Array;
  };
}

// Server → Client: Awareness 수신 포맷 (백엔드가 { data: { cardsetId, awareness: number[] } } 형태로 전송)
export interface ServerAwarenessMessage {
  data: {
    cardsetId: string;
    awareness: number[];
  };
}

// Client → Server: 인증
export interface AuthMessage extends YjsMessage {
  type: "auth";
  data: {
    token: string;
    userId: string;
    documentId: string;
  };
}

// Client → Server: 카드셋 조인
export interface JoinCardsetMessage extends YjsMessage {
  type: "join-cardset";
  data: {
    cardsetId: string;
  };
}

// Client → Server: 카드셋 나가기
export interface LeaveCardsetMessage extends YjsMessage {
  type: "leave-cardset";
  data: {
    cardsetId: string;
  };
}

// Server → Client: 접근 권한 응답
export interface AccessControlMessage extends YjsMessage {
  type: "access-control";
  data: {
    hasAccess: boolean;
    currentEditor?: string;
    message: string;
  };
}

// Server → Client: 초기 카드셋 상태
export interface CardsetStateMessage extends YjsMessage {
  type: "cardset-state";
  data: {
    cardsetId: string;
    cards: any[];
  };
}

// Server → Client: 토큰 만료
export interface ExpiredMessage extends YjsMessage {
  type: "expired";
  data?: {
    message?: string;
  };
}
