import type { Socket } from "socket.io-client";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

const asSocket = (socket: FakeSocket): Socket => socket as unknown as Socket;

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
