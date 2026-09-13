// @vitest-environment jsdom

import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CardData } from "./card-types";

const providerInstances = vi.hoisted(() => [] as unknown[]);
const mockControls = vi.hoisted(() => ({
  shouldFailNextConnection: false,
  pendingConnection: undefined as Promise<boolean> | undefined,
}));

vi.mock("./yjs-provider", () => {
  class MockYjsProvider {
    hasAccess = false;
    cards: CardData[] = [];
    cardsChangeCallback?: (cards: CardData[]) => void;
    awarenessChangeCallback?: (states: Map<number, unknown>) => void;
    syncedCallback?: () => void;
    disconnectCallback?: () => void;
    connect = vi.fn(async () => {
      if (mockControls.shouldFailNextConnection) {
        mockControls.shouldFailNextConnection = false;
        throw new Error("handshake failed");
      }
      if (mockControls.pendingConnection) {
        const pendingConnection = mockControls.pendingConnection;
        mockControls.pendingConnection = undefined;
        const success = await pendingConnection;
        this.hasAccess = success;
        return success;
      }
      this.hasAccess = true;
      return true;
    });
    disconnect = vi.fn(() => {
      this.hasAccess = false;
    });

    constructor() {
      providerInstances.push(this);
    }

    getHasAccess(): boolean {
      return this.hasAccess;
    }

    getCards(): CardData[] {
      return this.cards;
    }

    getAwarenessStates(): Map<number, unknown> {
      return new Map();
    }

    onCardsChange(callback: (cards: CardData[]) => void): void {
      this.cardsChangeCallback = callback;
    }

    onAwarenessChange(callback: (states: Map<number, unknown>) => void): void {
      this.awarenessChangeCallback = callback;
    }

    onSynced(callback: () => void): void {
      this.syncedCallback = callback;
    }

    onDisconnect(callback: () => void): void {
      this.disconnectCallback = callback;
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

import { useYjs } from "./use-yjs";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

type HookState = ReturnType<typeof useYjs>;
type MockProvider = {
  hasAccess: boolean;
  cards: CardData[];
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  cardsChangeCallback?: (cards: CardData[]) => void;
  awarenessChangeCallback?: (states: Map<number, unknown>) => void;
  syncedCallback?: () => void;
  disconnectCallback?: () => void;
};

const latestProvider = (): MockProvider => {
  const provider = providerInstances.at(-1);
  if (!provider) throw new Error("YjsProvider 인스턴스가 생성되지 않았습니다.");
  return provider as MockProvider;
};

function HookHarness({ onChange }: { onChange: (state: HookState) => void }) {
  const state = useYjs({
    cardsetId: "cardset-1",
    userId: "user-1",
    autoConnect: false,
  });

  useEffect(() => {
    onChange(state);
  }, [onChange, state]);

  return null;
}

describe("useYjs 상태 전이", () => {
  let container: HTMLDivElement;
  let root: Root;
  let state: HookState | undefined;

  const renderHook = async (): Promise<void> => {
    await act(async () => {
      root.render(
        <HookHarness
          onChange={(nextState) => {
            state = nextState;
          }}
        />,
      );
    });
  };

  beforeEach(() => {
    providerInstances.length = 0;
    mockControls.shouldFailNextConnection = false;
    mockControls.pendingConnection = undefined;
    state = undefined;
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("연결·동기화·변경 이벤트를 React 상태로 반영한다", async () => {
    await renderHook();

    await act(async () => {
      await state?.connect("replacement-token");
    });

    const provider = latestProvider();
    expect(provider.connect).toHaveBeenCalledWith("replacement-token");
    expect(state).toMatchObject({
      isConnected: true,
      hasAccess: true,
      hasSynced: false,
      connectionError: null,
    });

    await act(async () => {
      provider.cardsChangeCallback?.([
        { id: "card-1", question: "질문", answer: "답변" },
      ]);
      provider.awarenessChangeCallback?.(
        new Map([[2, { field: "question", cardIndex: 0 }]]),
      );
      provider.syncedCallback?.();
    });

    expect(state?.cards).toEqual([
      { id: "card-1", question: "질문", answer: "답변" },
    ]);
    expect(state?.awarenessStates).toEqual(
      new Map([[2, { field: "question", cardIndex: 0 }]]),
    );
    expect(state?.hasSynced).toBe(true);
  });

  it("연결 해제 이벤트가 협업 상태를 해제한다", async () => {
    await renderHook();
    await act(async () => {
      await state?.connect();
    });

    const provider = latestProvider();
    provider.hasAccess = false;
    await act(async () => {
      provider.disconnectCallback?.();
    });

    expect(state).toMatchObject({ isConnected: false, hasAccess: false });
  });

  it("연결 실패를 오류 상태로 노출하고 권한을 부여하지 않는다", async () => {
    await renderHook();
    mockControls.shouldFailNextConnection = true;

    await act(async () => {
      await expect(state?.connect()).resolves.toBe(false);
    });

    expect(state).toMatchObject({
      isConnected: false,
      hasAccess: false,
      connectionError: "handshake failed",
    });
  });

  it("연결 중 중복 요청은 하나의 handshake 결과를 공유한다", async () => {
    await renderHook();

    let resolveConnection: ((success: boolean) => void) | undefined;
    mockControls.pendingConnection = new Promise<boolean>((resolve) => {
      resolveConnection = resolve;
    });

    let firstConnection: Promise<boolean> | undefined;
    let secondConnection: Promise<boolean> | undefined;
    await act(async () => {
      firstConnection = state?.connect();
      secondConnection = state?.connect();
    });

    expect(firstConnection).toBe(secondConnection);
    expect(providerInstances).toHaveLength(1);

    resolveConnection?.(true);
    await act(async () => {
      await expect(firstConnection).resolves.toBe(true);
    });

    expect(state).toMatchObject({ isConnected: true, hasAccess: true });
  });
});
