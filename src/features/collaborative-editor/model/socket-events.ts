type BinaryPayload = Uint8Array | number[];

type CardsetEventPayload = {
  cardsetId: string;
};

export type AuthMessage = {
  type: "auth";
  data: {
    token: string;
    userId: string;
    cardsetId: string;
  };
};

export type JoinCardsetMessage = {
  type: "join-cardset";
  data: CardsetEventPayload;
};

export type LeaveCardsetMessage = {
  type: "leave-cardset";
  data: CardsetEventPayload;
};

export type UpdateMessage = {
  type: "update";
  data: CardsetEventPayload & {
    update: Uint8Array;
  };
};

export type AwarenessMessage = {
  type: "awareness";
  data: CardsetEventPayload & {
    awareness: Uint8Array;
  };
};

export type ClientMessage =
  | AuthMessage
  | JoinCardsetMessage
  | LeaveCardsetMessage
  | UpdateMessage
  | AwarenessMessage;

export type SyncMessage = {
  cardsetId: string;
  update: BinaryPayload;
};

type AwarenessPayload = CardsetEventPayload & {
  awareness: BinaryPayload;
  userId: string;
  userName: string;
};

export type ServerAwarenessMessage =
  | { data: AwarenessPayload }
  | AwarenessPayload;
