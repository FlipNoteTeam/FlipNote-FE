export interface YjsMessage {
  type:
    | "sync"
    | "update"
    | "awareness"
    | "auth"
    | "expired"
    | "access-control";
  data?: unknown;
}

export interface SyncMessage extends YjsMessage {
  type: "sync";
  data: {
    syncStep: number;
    update?: Uint8Array;
  };
}

export interface UpdateMessage extends YjsMessage {
  type: "update";
  data: {
    update: Uint8Array;
  };
}

export interface AwarenessMessage extends YjsMessage {
  type: "awareness";
  data: {
    awareness: Uint8Array;
  };
}

export interface AuthMessage extends YjsMessage {
  type: "auth";
  data: {
    token: string;
    userId: string;
    documentId: string;
  };
}

export interface ExpiredMessage extends YjsMessage {
  type: "expired";
  data: {
    message: string;
  };
}

export interface AccessControlMessage extends YjsMessage {
  type: "access-control";
  data: {
    hasAccess: boolean;
    currentEditor?: string;
    message: string;
  };
}
