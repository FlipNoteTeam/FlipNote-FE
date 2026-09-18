import type { Socket } from "socket.io-client";

type EventHandler = (...args: unknown[]) => void;

/**
 * Socket.io 서버 없이 provider의 이벤트 흐름을 검증하기 위한 test double.
 * 통합 테스트의 peer 전달 규칙은 이 클래스를 확장해 각 테스트에 명시한다.
 */
export class FakeSocket {
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

export const asSocket = (socket: FakeSocket): Socket =>
  socket as unknown as Socket;
