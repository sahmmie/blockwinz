import React, { createContext, useContext } from 'react';
import { useSocket } from '../hooks/useSocket';

const SocketContext = createContext<ReturnType<typeof useSocket> | undefined>(
  undefined,
);

export const SocketProvider: React.FC<{
  children: React.ReactNode;
  namespace: string;
}> = ({ children, namespace }) => {
  const socketState = useSocket(namespace);

  return (
    <SocketContext.Provider value={socketState}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = (): ReturnType<typeof useSocket> => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};
