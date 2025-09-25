export interface ServerToClientEvents {
  // 기본 연결 이벤트
  connect: () => void;
  disconnect: () => void;

  // 사용자 이벤트
  userJoined: (data: { userId: string; username: string }) => void;
  userLeft: (data: { userId: string; username: string }) => void;

  // 메시지 이벤트
  messageReceived: (data: {
    id: string;
    content: string;
    userId: string;
    timestamp: string;
  }) => void;

  // 알림 이벤트
  notificationReceived: (data: {
    id: string;
    type: string;
    message: string;
    timestamp: string;
  }) => void;

  // 에러 이벤트
  error: (data: { message: string; code?: string }) => void;
}

export interface ClientToServerEvents {
  // 룸 관리
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;

  // 메시지 전송
  sendMessage: (data: { roomId: string; content: string }) => void;

  // 상태 업데이트
  updateStatus: (status: "online" | "away" | "busy") => void;

  // 인증
  authenticate: (token: string) => void;
}

export const SocketEvents = {
  // Server to Client
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  USER_JOINED: "userJoined",
  USER_LEFT: "userLeft",
  MESSAGE_RECEIVED: "messageReceived",
  NOTIFICATION_RECEIVED: "notificationReceived",
  ERROR: "error",

  // Client to Server
  JOIN_ROOM: "joinRoom",
  LEAVE_ROOM: "leaveRoom",
  SEND_MESSAGE: "sendMessage",
  UPDATE_STATUS: "updateStatus",
  AUTHENTICATE: "authenticate",
} as const;
