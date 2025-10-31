import { useEffect, useRef, useState, useCallback } from "react";
import { YjsProvider } from "./yjs-provider";
import type { CardData } from "./card-types";

interface UseYjsOptions {
  documentId: string;
  userId: string;
  token?: string;
  autoConnect?: boolean;
}

export function useYjs(options: UseYjsOptions) {
  const { documentId, userId, token, autoConnect = false } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [cards, setCards] = useState<CardData[]>([]);

  const providerRef = useRef<YjsProvider | null>(null);

  const connect = useCallback(
    async (authToken?: string) => {
      try {
        const provider = new YjsProvider(documentId, userId);
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

          // 초기 카드 로드
          setCards(provider.getCards());

          return true;
        }
        return false;
      } catch (error) {
        setConnectionError(
          error instanceof Error ? error.message : "Connection failed"
        );
        setIsConnected(false);
        setHasAccess(false);
        return false;
      }
    },
    [documentId, userId, token]
  );

  const disconnect = useCallback(() => {
    if (providerRef.current) {
      providerRef.current.disconnect();
      providerRef.current = null;
    }
    setIsConnected(false);
    setHasAccess(false);
    setConnectionError(null);
  }, []);

  const addCard = useCallback(
    (card: Omit<CardData, "id" | "createdAt">): string => {
      if (providerRef.current?.getHasAccess()) {
        return providerRef.current.addCard(card);
      }
      return "";
    },
    []
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
      cursor?: { index: number; length: number }
    ) => {
      if (providerRef.current?.getHasAccess()) {
        providerRef.current.setAwareness(field, cardIndex, cursor);
      }
    },
    []
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
    connectionError,
    cards,
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
