import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Socket } from "socket.io-client";
import * as Y from "yjs";
import type { CardData } from "./card-types";

vi.mock("./index", () => ({
  socketManager: {
    connect: vi.fn(),
    disconnect: vi.fn(),
  },
}));

import { socketManager } from "./index";
import { YjsProvider } from "./yjs-provider";

type EventHandler = (...args: unknown[]) => void;

class FakeSocket {
  connected = false;
  readonly emitted: Array<{ event: string; payload: unknown }> = [];
  private readonly listeners = new Map<string, Set<EventHandler>>();
  private readonly onceListeners = new Map<string, Set<EventHandler>>();

  on(event: string, handler: EventHandler): this {
    this.addListener(this.listeners, event, handler);
    return this;
  }

  once(event: string, handler: EventHandler): this {
    this.addListener(this.onceListeners, event, handler);
    return this;
  }

  off(event: string, handler: EventHandler): this {
    this.listeners.get(event)?.delete(handler);
    this.onceListeners.get(event)?.delete(handler);
    return this;
  }

  emit(event: string, payload: unknown): boolean {
    this.emitted.push({ event, payload });
    return true;
  }

  trigger(event: string, ...args: unknown[]): void {
    const persistent = [...(this.listeners.get(event) ?? [])];
    const once = [...(this.onceListeners.get(event) ?? [])];
    this.onceListeners.delete(event);

    [...persistent, ...once].forEach((handler) => handler(...args));
  }

  private addListener(
    target: Map<string, Set<EventHandler>>,
    event: string,
    handler: EventHandler,
  ): void {
    const handlers = target.get(event) ?? new Set<EventHandler>();
    handlers.add(handler);
    target.set(event, handlers);
  }
}

const getDocument = (provider: YjsProvider): Y.Doc =>
  (provider as unknown as { doc: Y.Doc }).doc;

const makeUpdate = (cards: CardData[]): Uint8Array => {
  const document = new Y.Doc();
  const cardsArray = document.getArray<Y.Map<unknown>>("cards");

  cardsArray.push(
    cards.map((card) => {
      const cardMap = new Y.Map<unknown>();
      cardMap.set("id", card.id);
      cardMap.set("question", new Y.Text(card.question));
      cardMap.set("answer", new Y.Text(card.answer));
      return cardMap;
    }),
  );

  return Y.encodeStateAsUpdate(document);
};

const asSocket = (socket: FakeSocket): Socket => socket as unknown as Socket;

describe("YjsProvider 협업 회귀", () => {
  let socket: FakeSocket;
  let provider: YjsProvider;

  const connect = async (): Promise<void> => {
    const connection = provider.connect("access-token");
    socket.connected = true;
    socket.trigger("connect");
    await expect(connection).resolves.toBe(true);
  };

  const sync = (cards: CardData[]): void => {
    socket.trigger("sync", {
      cardsetId: "cardset-1",
      update: Array.from(makeUpdate(cards)),
    });
  };

  beforeEach(() => {
    socket = new FakeSocket();
    provider = new YjsProvider("cardset-1", "user-1");
    vi.mocked(socketManager.connect).mockReturnValue(asSocket(socket));
  });

  it("인증된 사용자 정보로 요청한 카드셋 룸에 입장한다", async () => {
    await connect();

    expect(socket.emitted).toEqual([
      {
        event: "auth",
        payload: {
          token: "access-token",
          userId: "user-1",
          cardsetId: "cardset-1",
        },
      },
      {
        event: "join-cardset",
        payload: { cardsetId: "cardset-1" },
      },
    ]);
    expect(provider.getHasAccess()).toBe(true);
    expect(provider.getHasSynced()).toBe(false);
    expect(provider.getCards()).toEqual([]);
  });

  it("서버 문서를 반영한 뒤 카드를 추가하고 변경 사항을 전파한다", async () => {
    await connect();
    sync([{ id: "existing", question: "question", answer: "answer" }]);

    const addedId = provider.addCard({ question: "new question", answer: "new answer" });

    expect(provider.getHasSynced()).toBe(true);
    expect(provider.getCards()).toEqual([
      { id: "existing", question: "question", answer: "answer" },
      { id: addedId, question: "new question", answer: "new answer" },
    ]);

    const updateMessages = socket.emitted.filter(
      ({ event }) => event === "update",
    );
    expect(updateMessages).toHaveLength(1);
    expect(updateMessages[0]?.payload).toMatchObject({
      cardsetId: "cardset-1",
      update: expect.any(Uint8Array),
    });
  });

  it("질문과 답변을 독립적인 Y.Text로 관리하여 동시 수정이 덮어써지지 않고 수렴한다", async () => {
    await connect();
    sync([{ id: "card-1", question: "base", answer: "answer" }]);

    const remoteDocument = new Y.Doc();
    Y.applyUpdate(remoteDocument, Y.encodeStateAsUpdate(getDocument(provider)));

    const localQuestion = provider.getCardQuestionText(0);
    const remoteQuestion = remoteDocument
      .getArray<Y.Map<unknown>>("cards")
      .get(0)
      ?.get("question") as Y.Text | undefined;

    expect(localQuestion).not.toBeNull();
    expect(remoteQuestion).toBeDefined();

    localQuestion?.insert(4, " local");
    remoteQuestion?.insert(4, " remote");

    const localUpdate = Y.encodeStateAsUpdate(getDocument(provider));
    const remoteUpdate = Y.encodeStateAsUpdate(remoteDocument);
    Y.applyUpdate(getDocument(provider), remoteUpdate);
    Y.applyUpdate(remoteDocument, localUpdate);

    expect(provider.getCardQuestionText(0)?.toString()).toBe(
      remoteQuestion?.toString(),
    );
    expect(provider.getCardQuestionText(0)?.toString()).toContain("local");
    expect(provider.getCardQuestionText(0)?.toString()).toContain("remote");
    expect(provider.getCardAnswerText(0)?.toString()).toBe("answer");
  });

  it("원격 Awareness를 반영해 편집자의 카드와 필드를 식별한다", async () => {
    await connect();
    sync([{ id: "card-1", question: "question", answer: "answer" }]);

    const remoteDocument = new Y.Doc();
    const remoteAwareness = new (await import("y-protocols/awareness")).Awareness(
      remoteDocument,
    );
    remoteAwareness.setLocalState({
      user: { id: "user-2", name: "Editor Two" },
      cardIndex: 0,
      field: "answer",
      cursor: { index: 2, length: 0 },
    });
    const awarenessProtocol = await import("y-protocols/awareness");
    const update = awarenessProtocol.encodeAwarenessUpdate(remoteAwareness, [
      remoteDocument.clientID,
    ]);

    socket.trigger("awareness", {
      data: { cardsetId: "cardset-1", awareness: Array.from(update) },
    });

    expect(provider.getAwarenessStates().get(remoteDocument.clientID)).toMatchObject({
      user: { id: "user-2", name: "Editor Two" },
      cardIndex: 0,
      field: "answer",
      cursor: { index: 2, length: 0 },
    });
  });

  it("연결이 끊기면 편집 권한을 해제하여 이후 카드 수정을 막는다", async () => {
    await connect();
    sync([{ id: "card-1", question: "question", answer: "answer" }]);
    const onDisconnect = vi.fn();
    provider.onDisconnect(onDisconnect);

    socket.trigger("disconnect");
    provider.updateCardQuestion(0, "must not be written");

    expect(onDisconnect).toHaveBeenCalledOnce();
    expect(provider.getHasAccess()).toBe(false);
    expect(provider.getCards()).toEqual([
      { id: "card-1", question: "question", answer: "answer" },
    ]);
  });
});
