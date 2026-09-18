import { useEffect, useRef, useState, useCallback } from "react";
import { YjsProvider } from "./yjs-provider";
import type { CardData } from "./card-types";

interface UseYjsOptions {
  cardsetId: string;
  userId: string;
  autoConnect?: boolean;
}

type ConnectionAttempt = {
  attemptCount: number;
  isConnecting: boolean;
};

export function useYjs(options: UseYjsOptions) {
  const { cardsetId, userId, autoConnect = false } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [awarenessStates, setAwarenessStates] = useState<Map<number, unknown>>(
    new Map(),
  );
  const [connectionAttempt, setConnectionAttempt] =
    useState<ConnectionAttempt>({
      attemptCount: 0,
      isConnecting: false,
    });

  const providerRef = useRef<YjsProvider | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const connect = useCallback(
    (): void => {
      setConnectionAttempt((currentAttempt) => {
        if (
          currentAttempt.isConnecting ||
          providerRef.current?.getHasAccess()
        ) {
          return currentAttempt;
        }

        return {
          attemptCount: currentAttempt.attemptCount + 1,
          isConnecting: true,
        };
      });
    },
    [],
  );

  useEffect(() => {
    if (!connectionAttempt.isConnecting) return;

    const { attemptCount } = connectionAttempt;
    const provider = new YjsProvider(cardsetId, userId);
    let isCurrentAttempt = true;

    unsubscribeRef.current?.();
    providerRef.current?.disconnect();
    providerRef.current = provider;

    unsubscribeRef.current = provider.subscribe({
      onCardsChange: (updatedCards) => {
        setCards(updatedCards);
      },
      onAwarenessChange: (states) => {
        setAwarenessStates(new Map(states));
      },
      onSynced: () => {
        setHasSynced(true);
      },
      onDisconnect: () => {
        setIsConnected(false);
        setHasAccess(false);
      },
    });

    provider
      .connect("")
      .then((success) => {
        if (!isCurrentAttempt || !success) return;

        setIsConnected(true);
        setHasAccess(provider.getHasAccess());
        setConnectionError(null);

        setCards(provider.getCards());
        setAwarenessStates(new Map(provider.getAwarenessStates()));
      })
      .catch((error) => {
        if (!isCurrentAttempt) return;

        setConnectionError(
          error instanceof Error ? error.message : "Connection failed",
        );
        setIsConnected(false);
        setHasAccess(false);
      })
      .finally(() => {
        if (!isCurrentAttempt) return;

        setConnectionAttempt((currentAttempt) =>
          currentAttempt.attemptCount === attemptCount
            ? { ...currentAttempt, isConnecting: false }
            : currentAttempt,
        );
      });

    return () => {
      isCurrentAttempt = false;
    };
  }, [cardsetId, connectionAttempt, userId]);

  const disconnect = useCallback(() => {
    setConnectionAttempt((currentAttempt) => ({
      ...currentAttempt,
      isConnecting: false,
    }));
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
    if (providerRef.current) {
      providerRef.current.disconnect();
      providerRef.current = null;
    }
    setIsConnected(false);
    setHasAccess(false);
    setHasSynced(false);
    setConnectionError(null);
  }, []);

  const addCard = useCallback(
    (card: Omit<CardData, "id" | "createdAt">): string => {
      if (providerRef.current?.getHasAccess()) {
        return providerRef.current.addCard(card);
      }
      return "";
    },
    [],
  );

  const deleteCard = useCallback((index: number) => {
    if (providerRef.current?.getHasAccess()) {
      providerRef.current.deleteCard(index);
    }
  }, []);

  const updateCardQuestion = useCallback((index: number, question: string) => {
    if (providerRef.current?.getHasAccess()) {
      providerRef.current.updateCardQuestion(index, question);
    }
  }, []);

  const updateCardAnswer = useCallback((index: number, answer: string) => {
    if (providerRef.current?.getHasAccess()) {
      providerRef.current.updateCardAnswer(index, answer);
    }
  }, []);

  const setAwareness = useCallback(
    (
      field: "question" | "answer",
      cardIndex: number,
      cursor?: { index: number; length: number },
    ) => {
      if (providerRef.current?.getHasAccess()) {
        providerRef.current.setAwareness(field, cardIndex, cursor);
      }
    },
    [],
  );

  const getCardQuestionText = useCallback((index: number) => {
    return providerRef.current?.getCardQuestionText(index) || null;
  }, []);

  const getCardAnswerText = useCallback((index: number) => {
    return providerRef.current?.getCardAnswerText(index) || null;
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    isConnecting: connectionAttempt.isConnecting,
    hasAccess,
    hasSynced,
    connectionError,
    cards,
    awarenessStates,
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
