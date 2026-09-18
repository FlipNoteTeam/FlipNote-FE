import { beforeEach, describe, expect, it, vi } from "vitest";
import { asSocket, FakeSocket } from "./fixtures/fake-socket";

vi.mock("@/shared/socket", () => ({
  socketManager: {
    connect: vi.fn(),
    disconnect: vi.fn(),
  },
}));

import { socketManager } from "@/shared/socket";
import { YjsProvider } from "../yjs-provider";

describe("YjsProvider 연결 취소", () => {
  let socket: FakeSocket;
  let provider: YjsProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    socket = new FakeSocket();
    provider = new YjsProvider("cardset-1", "user-1");
    vi.mocked(socketManager.connect).mockReturnValue(asSocket(socket));
  });

  it("연결 대기 중 취소하면 소켓을 정리하고 Promise를 실패 처리한다", async () => {
    const connection = provider.connect("access-token");

    provider.cancelConnection();

    await expect(connection).rejects.toThrow("Connection cancelled");
    expect(socketManager.disconnect).toHaveBeenCalledOnce();
    expect(provider.getHasAccess()).toBe(false);
    expect(socket.emitted).toEqual([]);
  });

  it("연결된 상태에서 해제하면 카드셋 퇴장을 알리고 소켓을 종료한다", async () => {
    const connection = provider.connect("access-token");
    socket.connected = true;
    socket.trigger("connect");
    await expect(connection).resolves.toBe(true);

    provider.disconnect();

    expect(socket.emitted).toContainEqual({
      event: "leave-cardset",
      payload: { cardsetId: "cardset-1" },
    });
    expect(socketManager.disconnect).toHaveBeenCalledOnce();
  });
});
