export interface ServerToClientEvents {
  // 기본 연결 이벤트
  connect: () => void;
  disconnect: () => void;

  // 카드셋 상태
  "cardset-state": (data: { cardsetId: string; cards: any[] }) => void;

  // Yjs 동기화
  sync: (data: {
    cardsetId?: string;
    syncStep?: number;
    update: Uint8Array<ArrayBuffer>;
  }) => void;

  // Awareness (커서 위치 등)
  awareness: (data: { cardsetId: string; awareness:  Uint8Array<ArrayBuffer> }) => void;

  // 토큰 만료
  expired: (data?: { message?: string }) => void;

  // 에러
  error: (data: { message: string; code?: string }) => void;
}

export interface ClientToServerEvents {
  // 인증
  auth: (data: { token: string; userId: string; cardsetId: string }) => void;

  // 카드셋 룸 관리
  "join-cardset": (data: { cardsetId: string }) => void;
  "leave-cardset": (data: { cardsetId: string }) => void;

  // Yjs 업데이트 전송
  update: (data: { cardsetId: string; update: Uint8Array<ArrayBuffer> }) => void;

  // Awareness (커서 위치 등) 전송
  awareness: (data: { cardsetId: string; awareness: Uint8Array<ArrayBuffer> }) => void;
}

export const SocketEvents = {
  // Server to Client
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  ACCESS_CONTROL: "access-control",
  CARDSET_STATE: "cardset-state",
  SYNC: "sync",
  AWARENESS: "awareness",
  EXPIRED: "expired",
  ERROR: "error",

  // Client to Server
  AUTH: "auth",
  JOIN_CARDSET: "join-cardset",
  LEAVE_CARDSET: "leave-cardset",
  UPDATE: "update",
} as const;
