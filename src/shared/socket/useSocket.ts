import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { socketManager } from './index';
import { ServerToClientEvents, ClientToServerEvents } from './events';

interface UseSocketOptions {
  autoConnect?: boolean;
  token?: string;
}

export function useSocket(options: UseSocketOptions = {}) {
  const { autoConnect = false, token } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const connect = () => {
    try {
      socketRef.current = socketManager.connect(token);
      setConnectionError(null);
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Connection failed');
    }
  };

  const disconnect = () => {
    socketManager.disconnect();
    socketRef.current = null;
  };

  const emit = <T extends keyof ClientToServerEvents>(
    event: T,
    ...args: Parameters<ClientToServerEvents[T]>
  ) => {
    if (socketRef.current?.connected) {
      // @ts-expect-error - 타입 추론 한계로 인한 임시 처리
      socketRef.current.emit(event, ...args);
    } else {
      console.warn(`Cannot emit ${String(event)}: socket not connected`);
    }
  };

  const on = <T extends keyof ServerToClientEvents>(
    event: T,
    handler: ServerToClientEvents[T]
  ) => {
    if (socketRef.current) {
      // @ts-expect-error - 타입 추론 한계로 인한 임시 처리
      socketRef.current.on(event, handler);
    }
  };

  const off = <T extends keyof ServerToClientEvents>(
    event: T,
    handler?: ServerToClientEvents[T]
  ) => {
    if (socketRef.current) {
      // @ts-expect-error - 타입 추론 한계로 인한 임시 처리
      socketRef.current.off(event, handler);
    }
  };

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('connect_error');
      }
    };
  }, [autoConnect, token]);

  useEffect(() => {
    if (socketRef.current) {
      const handleConnect = () => setIsConnected(true);
      const handleDisconnect = () => setIsConnected(false);
      const handleConnectError = (error: Error) => {
        setConnectionError(error.message);
        setIsConnected(false);
      };

      socketRef.current.on('connect', handleConnect);
      socketRef.current.on('disconnect', handleDisconnect);
      socketRef.current.on('connect_error', handleConnectError);

      return () => {
        socketRef.current?.off('connect', handleConnect);
        socketRef.current?.off('disconnect', handleDisconnect);
        socketRef.current?.off('connect_error', handleConnectError);
      };
    }
  }, [socketRef.current]);

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
}