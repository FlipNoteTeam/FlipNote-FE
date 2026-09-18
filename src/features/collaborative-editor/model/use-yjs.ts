import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { CardData } from "./card-types";
import {
  type YjsProviderSnapshot,
  YjsProvider,
} from "./yjs-provider";

interface UseYjsOptions {
  cardsetId: string;
  userId: string;
  autoConnect?: boolean;
}

const disconnectedSnapshot: YjsProviderSnapshot = {
  isConnected: false,
  isConnecting: false,
  hasAccess: false,
  hasSynced: false,
  connectionError: null,
  cards: [],
  awarenessStates: new Map(),
};

const noopUnsubscribe = () => undefined;

export function useYjs(options: UseYjsOptions) {
  const { cardsetId, userId, autoConnect = false } = options;
  const providerRef = useRef<YjsProvider | null>(null);
  const [provider, setProvider] = useState<YjsProvider | null>(null);

  const subscribe = useCallback(
    (listener: () => void) => provider?.subscribe(listener) ?? noopUnsubscribe,
    [provider],
  );
  const getSnapshot = useCallback(
    () => provider?.getSnapshot() ?? disconnectedSnapshot,
    [provider],
  );
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const connect = useCallback((): void => {
    const currentProvider = providerRef.current;
    if (
      currentProvider?.getSnapshot().isConnecting ||
      currentProvider?.getHasAccess()
    ) {
      return;
    }

    currentProvider?.disconnect();
    const nextProvider = new YjsProvider(cardsetId, userId);
    providerRef.current = nextProvider;
    setProvider(nextProvider);
    void nextProvider.connect("").catch(() => undefined);
  }, [cardsetId, userId]);

  const disconnect = useCallback(() => {
    providerRef.current?.disconnect();
    providerRef.current = null;
    setProvider(null);
  }, []);

  const addCard = useCallback(
    (card: Omit<CardData, "id">): string =>
      providerRef.current?.addCard(card) ?? "",
    [],
  );
  const deleteCard = useCallback(
    (index: number): void => providerRef.current?.deleteCard(index),
    [],
  );
  const updateCardQuestion = useCallback(
    (index: number, question: string): void =>
      providerRef.current?.updateCardQuestion(index, question),
    [],
  );
  const updateCardAnswer = useCallback(
    (index: number, answer: string): void =>
      providerRef.current?.updateCardAnswer(index, answer),
    [],
  );
  const setAwareness = useCallback(
    (
      field: "question" | "answer",
      cardIndex: number,
      cursor?: { index: number; length: number },
    ): void => providerRef.current?.setAwareness(field, cardIndex, cursor),
    [],
  );
  const getCardQuestionText = useCallback(
    (index: number) => providerRef.current?.getCardQuestionText(index) ?? null,
    [],
  );
  const getCardAnswerText = useCallback(
    (index: number) => providerRef.current?.getCardAnswerText(index) ?? null,
    [],
  );

  useEffect(() => {
    if (autoConnect) connect();
    return disconnect;
  }, [autoConnect, connect, disconnect]);

  return {
    ...snapshot,
    connect,
    disconnect,
    addCard,
    deleteCard,
    updateCardQuestion,
    updateCardAnswer,
    setAwareness,
    getCardQuestionText,
    getCardAnswerText,
    provider: providerRef.current,
  };
}
