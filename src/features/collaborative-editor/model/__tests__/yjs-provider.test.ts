import { beforeEach, describe, expect, it, vi } from "vitest";
import * as Y from "yjs";
import type { CardData } from "../card-types";
import { asSocket, FakeSocket } from "./fixtures/fake-socket";

vi.mock("@/shared/socket", () => ({
  socketManager: {
    connect: vi.fn(),
    disconnect: vi.fn(),
  },
}));

import { socketManager } from "@/shared/socket";
import { YjsProvider } from "../yjs-provider";

const getDocument = (provider: YjsProvider): Y.Doc =>
  (
    provider as unknown as {
      document: { doc: Y.Doc };
    }
  ).document.doc;

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
    expect(provider.getSnapshot().localClientId).toBe(
      getDocument(provider).clientID,
    );
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

  it("두 클라이언트가 질문을 동시에 수정해도 Y.Text 변경이 수렴한다", async () => {
    await connect();
    sync([{ id: "card-1", question: "base", answer: "answer" }]);

    const remoteDocument = new Y.Doc();
    Y.applyUpdate(remoteDocument, Y.encodeStateAsUpdate(getDocument(provider)));

    const firstClientQuestion = provider.getCardQuestionText(0);
    const secondClientQuestion = remoteDocument
      .getArray<Y.Map<unknown>>("cards")
      .get(0)
      ?.get("question") as Y.Text | undefined;

    expect(firstClientQuestion).not.toBeNull();
    expect(secondClientQuestion).toBeDefined();

    firstClientQuestion?.insert(4, " first");
    secondClientQuestion?.insert(4, " second");

    const localUpdate = Y.encodeStateAsUpdate(getDocument(provider));
    const remoteUpdate = Y.encodeStateAsUpdate(remoteDocument);
    Y.applyUpdate(getDocument(provider), remoteUpdate);
    Y.applyUpdate(remoteDocument, localUpdate);

    expect(provider.getCardQuestionText(0)?.toString()).toBe(
      secondClientQuestion?.toString(),
    );
    expect(provider.getCardQuestionText(0)?.toString()).toContain("first");
    expect(provider.getCardQuestionText(0)?.toString()).toContain("second");
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
      user: { id: "user-2", name: "untrusted-name" },
      cardIndex: 0,
      field: "answer",
      cursor: { index: 2, length: 0 },
    });
    const awarenessProtocol = await import("y-protocols/awareness");
    const update = awarenessProtocol.encodeAwarenessUpdate(remoteAwareness, [
      remoteDocument.clientID,
    ]);

    socket.trigger("awareness", {
      data: {
        cardsetId: "cardset-1",
        awareness: Array.from(update),
        userId: "user-2",
        userName: "이이람람",
      },
    });

    expect(provider.getAwarenessStates().get(remoteDocument.clientID)).toMatchObject({
      user: { id: "user-2", name: "이이람람" },
      cardIndex: 0,
      field: "answer",
      cursor: { index: 2, length: 0 },
    });
  });

  it("연결이 끊기면 편집 권한을 해제하여 이후 카드 수정을 막는다", async () => {
    await connect();
    sync([{ id: "card-1", question: "question", answer: "answer" }]);
    const onDisconnect = vi.fn();
    provider.subscribe(onDisconnect);

    socket.trigger("disconnect");
    provider.updateCardQuestion(0, "must not be written");

    expect(onDisconnect).toHaveBeenCalledOnce();
    expect(provider.getHasAccess()).toBe(false);
    expect(provider.getCards()).toEqual([
      { id: "card-1", question: "question", answer: "answer" },
    ]);
  });
});
