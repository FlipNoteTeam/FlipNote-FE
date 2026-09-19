import * as awarenessProtocol from "y-protocols/awareness";
import { Awareness } from "y-protocols/awareness";
import type * as Y from "yjs";

type CardField = "question" | "answer";

type AwarenessUser = {
  id: string;
  name: string;
};

type AwarenessState = {
  user?: AwarenessUser;
};

export class YjsAwareness {
  private readonly awareness: Awareness;
  private onChangeCallback?: () => void;

  constructor(document: Y.Doc) {
    this.awareness = new Awareness(document);
    this.awareness.on("change", () => {
      this.onChangeCallback?.();
    });
  }

  onChange(callback: () => void): void {
    this.onChangeCallback = callback;
  }

  getStates(): Map<number, unknown> {
    return this.awareness.getStates() as Map<number, unknown>;
  }

  createUpdate(): Uint8Array {
    return awarenessProtocol.encodeAwarenessUpdate(
      this.awareness,
      Array.from(this.awareness.getStates().keys()),
    );
  }

  applyUpdate(update: Uint8Array, origin: unknown): void {
    awarenessProtocol.applyAwarenessUpdate(this.awareness, update, origin);
  }

  updateUserName(userId: string, userName: string): void {
    const states = this.awareness.getStates() as Map<number, AwarenessState>;

    states.forEach((state) => {
      if (state.user?.id === userId) {
        state.user = { ...state.user, name: userName };
      }
    });
  }

  setLocalState(
    field: CardField,
    cardIndex: number,
    user: AwarenessUser,
    cursor?: { index: number; length: number },
  ): void {
    this.awareness.setLocalStateField("field", field);
    this.awareness.setLocalStateField("cardIndex", cardIndex);
    if (cursor) {
      this.awareness.setLocalStateField("cursor", cursor);
    }
    this.awareness.setLocalStateField("user", user);
  }
}
