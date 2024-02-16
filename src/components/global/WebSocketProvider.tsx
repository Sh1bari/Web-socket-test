import React, { createContext, useContext, useEffect, useState } from 'react';
import Stomp from 'stompjs';

interface WebSocketProviderProps {
  children: React.ReactNode;
}

interface WebSocketContextProps {
  stompClient: Stomp.Client | null;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextProps>({ stompClient: null, isConnected: false });

export const useWebSocket = () => useContext(WebSocketContext);

const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [stompClient, setStompClient] = useState<Stomp.Client | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const socketUrl = 'https://vr.cloudioti.com/api/ws';
    //const socketUrl = 'http://localhost:8082/api/ws';
    const headers = {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    };

    const socket = new window.SockJS(socketUrl);
    const stomp = Stomp.over(socket);
    setStompClient(stomp);

    stomp.connect(headers, () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });

    return () => {
      if (stomp.connected) {
        stomp.disconnect(() => {
          console.log('WebSocket disconnected');
        });
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ stompClient, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;