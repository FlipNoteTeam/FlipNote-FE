import { useEffect, useRef, useState, useCallback } from "react";
import { YjsProvider } from "./yjs-provider";
import type { CardData } from "./card-types";

interface UseYjsOptions {
  cardsetId: string;
  userId: string;
  token?: string;
  autoConnect?: boolean;
}

export function useYjs(options: UseYjsOptions) {
  const { cardsetId, userId, token, autoConnect = false } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [awarenessStates, setAwarenessStates] = useState<Map<number, unknown>>(
    new Map(),
  );

  const providerRef = useRef<YjsProvider | null>(null);

  const connect = useCallback(
    async (authToken?: string) => {
      try {
        const provider = new YjsProvider(cardsetId, userId);
        providerRef.current = provider;

        const success = await provider.connect(authToken || token || "");
        if (success) {
          setIsConnected(true);
          setHasAccess(provider.getHasAccess());
          setConnectionError(null);

          // 카드 변경 리스너 설정
          provider.onCardsChange((updatedCards) => {
            setCards(updatedCards);
          });

          // Awareness 변경 리스너 설정
          provider.onAwarenessChange((states) => {
            setAwarenessStates(new Map(states));
          });

          // 초기 동기화 완료 콜백
          provider.onSynced(() => {
            setHasSynced(true);
          });

          // 소켓 끊김 콜백
          provider.onDisconnect(() => {
            setIsConnected(false);
            setHasAccess(false);
          });

          // 초기 카드 로드
          setCards(provider.getCards());

          // 초기 Awareness 로드
          setAwarenessStates(new Map(provider.getAwarenessStates()));

          return true;
        }
        return false;
      } catch (error) {
        setConnectionError(
          error instanceof Error ? error.message : "Connection failed",
        );
        setIsConnected(false);
        setHasAccess(false);
        return false;
      }
    },
    [cardsetId, userId, token],
  );

  const disconnect = useCallback(() => {
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
