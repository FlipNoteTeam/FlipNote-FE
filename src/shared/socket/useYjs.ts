import { useEffect, useRef, useState, useCallback } from 'react';
import { YjsProvider } from './yjs-provider';

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
  const [questionText, setQuestionText] = useState('');
  const [answerText, setAnswerText] = useState('');

  const providerRef = useRef<YjsProvider | null>(null);

  const connect = useCallback(async (authToken?: string) => {
    try {
      const provider = new YjsProvider(documentId, userId);
      providerRef.current = provider;

      const success = await provider.connect(authToken || token || '');

      if (success) {
        setIsConnected(true);
        setHasAccess(provider.getHasAccess());
        setConnectionError(null);

        // 텍스트 변경 리스너 설정
        const updateQuestion = () => setQuestionText(provider.getQuestionText());
        const updateAnswer = () => setAnswerText(provider.getAnswerText());

        provider.questionText.observe(updateQuestion);
        provider.answerText.observe(updateAnswer);

        // 초기 값 설정
        updateQuestion();
        updateAnswer();

        return true;
      }
      return false;
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Connection failed');
      setIsConnected(false);
      setHasAccess(false);
      return false;
    }
  }, [documentId, userId, token]);

  const disconnect = useCallback(() => {
    if (providerRef.current) {
      providerRef.current.disconnect();
      providerRef.current = null;
    }
    setIsConnected(false);
    setHasAccess(false);
    setConnectionError(null);
  }, []);

  const updateQuestion = useCallback((text: string) => {
    if (providerRef.current?.getHasAccess()) {
      providerRef.current.setQuestionText(text);
    }
  }, []);

  const updateAnswer = useCallback((text: string) => {
    if (providerRef.current?.getHasAccess()) {
      providerRef.current.setAnswerText(text);
    }
  }, []);

  const setAwareness = useCallback((field: 'question' | 'answer', cursor?: { index: number; length: number }) => {
    if (providerRef.current?.getHasAccess()) {
      providerRef.current.setAwareness(field, cursor);
    }
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
    questionText,
    answerText,
    connect,
    disconnect,
    updateQuestion,
    updateAnswer,
    setAwareness,
    provider: providerRef.current,
  };
}