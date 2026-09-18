import { beforeEach, describe, expect, it, vi } from "vitest";
import * as Y from "yjs";
import { asSocket, FakeSocket } from "./__tests__/fixtures/fake-socket";

vi.mock("./index", () => ({
  socketManager: {
    connect: vi.fn(),
    disconnect: vi.fn(),
  },
}));

import { socketManager } from "./index";
import { YjsProvider } from "./yjs-provider";

class ConnectedSocket extends FakeSocket {
  peer?: ConnectedSocket;

  override emit(event: string, payload: unknown): boolean {
    const wasEmitted = super.emit(event, payload);
    if (event === "update") {
      this.peer?.trigger("sync", payload);
    }
    if (event === "awareness") {
      this.peer?.trigger("awareness", { data: payload });
    }
    return wasEmitted;
  }
}

const emptyDocumentUpdate = (): Uint8Array => Y.encodeStateAsUpdate(new Y.Doc());

describe("YjsProvider 다중 참여자 통합", () => {
  let firstSocket: ConnectedSocket;
  let secondSocket: ConnectedSocket;
  let firstProvider: YjsProvider;
  let secondProvider: YjsProvider;

  beforeEach(async () => {
    vi.clearAllMocks();
    firstSocket = new ConnectedSocket();
    secondSocket = new ConnectedSocket();
    firstSocket.connected = true;
    secondSocket.connected = true;
    firstSocket.peer = secondSocket;
    secondSocket.peer = firstSocket;
    vi.mocked(socketManager.connect)
      .mockReturnValueOnce(asSocket(firstSocket))
      .mockReturnValueOnce(asSocket(secondSocket));

    firstProvider = new YjsProvider("cardset-1", "user-1");
    secondProvider = new YjsProvider("cardset-1", "user-2");

    const firstConnection = firstProvider.connect("token-1");
    const secondConnection = secondProvider.connect("token-2");
    firstSocket.trigger("connect");
    secondSocket.trigger("connect");
    await expect(firstConnection).resolves.toBe(true);
    await expect(secondConnection).resolves.toBe(true);

    // sync 완료 전의 local update는 의도적으로 송신하지 않으므로 먼저 빈 문서 sync를 보낸다.
    const update = Array.from(emptyDocumentUpdate());
    firstSocket.trigger("sync", { cardsetId: "cardset-1", update });
    secondSocket.trigger("sync", { cardsetId: "cardset-1", update });
  });

  it("한 참여자의 카드 생성과 텍스트 수정이 다른 참여자에게 반영된다", () => {
    firstProvider.addCard({ question: "질문", answer: "답변" });

    expect(secondProvider.getCards()).toEqual([
      expect.objectContaining({ question: "질문", answer: "답변" }),
    ]);

    firstProvider.updateCardQuestion(0, "수정된 질문");
    secondProvider.updateCardAnswer(0, "수정된 답변");

    expect(firstProvider.getCards()).toEqual([
      expect.objectContaining({ question: "수정된 질문", answer: "수정된 답변" }),
    ]);
    expect(secondProvider.getCards()).toEqual(firstProvider.getCards());
  });

  it("awareness가 상대 참여자에게 전달된다", () => {
    firstProvider.setAwareness("question", 0, { index: 2, length: 0 });

    const remoteState = Array.from(secondProvider.getAwarenessStates().values()).find(
      (state) => (state as { user?: { id?: string } }).user?.id === "user-1",
    ) as { field?: string; cardIndex?: number; cursor?: { index: number } } | undefined;

    expect(remoteState).toMatchObject({
      field: "question",
      cardIndex: 0,
      cursor: { index: 2 },
    });
  });
});
