import { useEffect, useCallback, useRef } from 'react';
import { getSocket, disconnectSocket } from '@/lib/socket';
import useAuth from './useAuth';
import type { Socket } from 'socket.io-client';
import { toaster } from '@/components/ui/toaster';
import { reportClientError } from '@/shared/utils/monitoring';

type SocketEventHandler<T = unknown> = (data: T) => void;

export const useSocket = <T = unknown>(namespace?: string) => {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const connectedNamespacesRef = useRef<Set<string>>(new Set([namespace || '/']));

  // Store event handlers: eventName => Set of handlers
  const eventHandlersRef = useRef<Map<string, Set<SocketEventHandler>>>(new Map());

  // Subscribe all stored event handlers to the socket
  const subscribeAllHandlers = (socket: Socket) => {
    eventHandlersRef.current.forEach((handlers, event) => {
      handlers.forEach(handler => socket.on(event, handler));
    });
  };

  // Unsubscribe all stored event handlers from the socket
  const unsubscribeAllHandlers = (socket: Socket) => {
    eventHandlersRef.current.forEach((handlers, event) => {
      handlers.forEach(handler => socket.off(event, handler));
    });
  };

  useEffect(() => {
    if (!namespace || !token) return;

    disconnectSocket(namespace);

    const socket = getSocket(namespace, token);
    socketRef.current = socket;

    const handleConnect = () => {
      console.log(`✅ Connected: ${namespace}`);
      connectedNamespacesRef.current.add(namespace);
      unsubscribeAllHandlers(socket);
      subscribeAllHandlers(socket);
    };

    const handleDisconnect = (reason: string) => {
      console.warn(`⚠️ Disconnected from ${namespace}: ${reason}`);
      connectedNamespacesRef.current.delete(namespace);
    }

    const handleError = (error: Error & { code: string, alert: boolean }) => {
      console.error(`❌ Error on ${namespace}: ${error.message}`);
      reportClientError('socket-hook', error, { namespace, code: error.code });
      if (error.alert) {
        toaster.create({
          description: error.message,
          type: 'error',
        });
      }
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('error', handleError);

    // Initial subscribe (no duplicates yet)
    subscribeAllHandlers(socket);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('error', handleError);

      unsubscribeAllHandlers(socket);
      disconnectSocket(namespace);
      socketRef.current = null;
      eventHandlersRef.current.clear();
    };
  }, [namespace, token]);


  // Register an event handler, and store it for resubscription
  const on = useCallback(
    <E = T>(event: string, handler: SocketEventHandler<E>) => {
      if (!socketRef.current) return;

      let handlers = eventHandlersRef.current.get(event);
      if (!handlers) {
        handlers = new Set();
        eventHandlersRef.current.set(event, handlers);
      }
      handlers.add(handler as SocketEventHandler);

      socketRef.current.on(event, handler as SocketEventHandler);
    },
    []
  );

  // Remove an event handler and remove it from stored handlers
  const off = useCallback(
    <E = T>(event: string, handler?: SocketEventHandler<E>) => {
      if (!socketRef.current) return;

      if (handler) {
        const handlers = eventHandlersRef.current.get(event);
        if (handlers) {
          handlers.delete(handler as SocketEventHandler);
          if (handlers.size === 0) {
            eventHandlersRef.current.delete(event);
          }
        }
        socketRef.current.off(event, handler as SocketEventHandler);
      } else {
        // Remove all handlers for this event
        const handlers = eventHandlersRef.current.get(event);
        if (handlers) {
          handlers.forEach(h => socketRef.current?.off(event, h));
          eventHandlersRef.current.delete(event);
        }
      }
    },
    []
  );

  // 'once' listeners are one-time and not resubscribed automatically (expected behavior)
  const once = useCallback(
    <E = T>(event: string, handler: SocketEventHandler<E>) => {
      socketRef.current?.once(event, handler as SocketEventHandler);
    },
    []
  );

  const emit = useCallback(
    <E = T, R = unknown>(event: string, data?: E, callback?: (response: R) => void) => {
      socketRef.current?.emit(event, data, callback);
    },
    []
  );

  const getSocketInstance = () => socketRef.current;

  const isConnected = () => {
    return connectedNamespacesRef.current.has(namespace || '/');
  };

  return {
    emit,
    on,
    off,
    once,
    isConnected,
    getSocketInstance,
    namespace,
  };
};
