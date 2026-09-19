// @vitest-environment jsdom

import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CardData } from "../card-types";

type ProviderSnapshot = {
  isConnected: boolean;
  isConnecting: boolean;
  hasAccess: boolean;
  hasSynced: boolean;
  connectionError: string | null;
  cards: CardData[];
  awarenessStates: Map<number, unknown>;
  localClientId: number | null;
};

const providerInstances = vi.hoisted(() => [] as unknown[]);
const mockControls = vi.hoisted(() => ({ shouldFailNextConnection: false }));

vi.mock("../yjs-provider", () => {
  class MockYjsProvider {
    snapshot: ProviderSnapshot = {
      isConnected: false,
      isConnecting: false,
      hasAccess: false,
      hasSynced: false,
      connectionError: null,
      cards: [],
      awarenessStates: new Map(),
      localClientId: 1,
    };
    listeners = new Set<() => void>();
    connect = vi.fn(async () => {
      if (mockControls.shouldFailNextConnection) {
        mockControls.shouldFailNextConnection = false;
        this.updateSnapshot({
          isConnecting: false,
          connectionError: "handshake failed",
        });
        throw new Error("handshake failed");
      }
      this.updateSnapshot({
        isConnected: true,
        isConnecting: false,
        hasAccess: true,
      });
      return true;
    });
    disconnect = vi.fn(() => {
      this.updateSnapshot({ isConnected: false, hasAccess: false });
    });

    constructor() {
      providerInstances.push(this);
    }

    getSnapshot(): ProviderSnapshot {
      return this.snapshot;
    }

    getHasAccess(): boolean {
      return this.snapshot.hasAccess;
    }

    subscribe(listener: () => void): () => void {
      this.listeners.add(listener);
      return () => this.listeners.delete(listener);
    }

    updateSnapshot(update: Partial<ProviderSnapshot>): void {
      this.snapshot = { ...this.snapshot, ...update };
      this.listeners.forEach((listener) => listener());
    }

    addCard = vi.fn(() => "new-card");
    deleteCard = vi.fn();
    updateCardQuestion = vi.fn();
    updateCardAnswer = vi.fn();
    setAwareness = vi.fn();
    getCardQuestionText = vi.fn(() => null);
    getCardAnswerText = vi.fn(() => null);
  }

  return { YjsProvider: MockYjsProvider };
});

import { useYjs } from "../use-yjs";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

type HookState = ReturnType<typeof useYjs>;
type MockProvider = {
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  updateSnapshot: (update: Partial<ProviderSnapshot>) => void;
};

const latestProvider = (): MockProvider => {
  const provider = providerInstances.at(-1);
  if (!provider) throw new Error("YjsProvider 인스턴스가 생성되지 않았습니다.");
  return provider as MockProvider;
};

function HookHarness({ onChange }: { onChange: (state: HookState) => void }) {
  const state = useYjs({ cardsetId: "cardset-1", userId: "user-1" });
  useEffect(() => onChange(state), [onChange, state]);
  return null;
}

describe("useYjs 상태 구독", () => {
  let container: HTMLDivElement;
  let root: Root;
  let state: HookState | undefined;

  beforeEach(() => {
    providerInstances.length = 0;
    mockControls.shouldFailNextConnection = false;
    state = undefined;
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it("provider snapshot 변경을 React 상태로 반영한다", async () => {
    await act(async () => {
      root.render(
        <HookHarness
          onChange={(nextState) => {
            state = nextState;
          }}
        />,
      );
    });
    await act(async () => state?.connect());

    const provider = latestProvider();
    await act(async () => {
      provider.updateSnapshot({
        hasSynced: true,
        cards: [{ id: "card-1", question: "질문", answer: "답변" }],
        awarenessStates: new Map([[2, { field: "question" }]]),
      });
    });

    expect(provider.connect).toHaveBeenCalledWith("");
    expect(state).toMatchObject({
      isConnected: true,
      hasAccess: true,
      hasSynced: true,
      cards: [{ id: "card-1", question: "질문", answer: "답변" }],
    });
  });

  it("연결 실패 snapshot을 그대로 노출한다", async () => {
    await act(async () => {
      root.render(
        <HookHarness
          onChange={(nextState) => {
            state = nextState;
          }}
        />,
      );
    });
    mockControls.shouldFailNextConnection = true;
    await act(async () => state?.connect());

    expect(state).toMatchObject({
      isConnected: false,
      hasAccess: false,
      connectionError: "handshake failed",
    });
  });

  it("연결 중 중복 요청은 하나의 provider handshake만 실행한다", async () => {
    await act(async () => {
      root.render(
        <HookHarness
          onChange={(nextState) => {
            state = nextState;
          }}
        />,
      );
    });

    await act(async () => {
      state?.connect();
      state?.connect();
    });

    expect(providerInstances).toHaveLength(1);
    expect(latestProvider().connect).toHaveBeenCalledOnce();
  });

  it("명시적 해제 시 provider 구독과 snapshot을 초기화한다", async () => {
    await act(async () => {
      root.render(
        <HookHarness
          onChange={(nextState) => {
            state = nextState;
          }}
        />,
      );
    });
    await act(async () => state?.connect());

    const provider = latestProvider();
    await act(async () => state?.disconnect());

    expect(provider.disconnect).toHaveBeenCalledOnce();
    expect(state).toMatchObject({
      isConnected: false,
      hasAccess: false,
      hasSynced: false,
      cards: [],
    });
  });
});
