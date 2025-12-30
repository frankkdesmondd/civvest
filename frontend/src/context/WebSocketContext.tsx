// src/context/WebSocketContext.tsx - FIXED VERSION
import React, { createContext, useContext, useEffect, useState } from 'react';

interface WebSocketContextType {
  subscribe: (event: string, callback: (data: any) => void) => void;
  unsubscribe: (event: string, callback: (data: any) => void) => void;
  send: (event: string, data: any) => void;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
  subscribe: () => {},
  unsubscribe: () => {},
  send: () => {},
  isConnected: false,
});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [listeners, setListeners] = useState<Record<string, ((data: any) => void)[]>>({});
  const [isConnected] = useState(false); // You can implement actual WebSocket connection logic later

  // Subscribe to custom events
  const subscribe = (event: string, callback: (data: any) => void) => {
    setListeners(prev => ({
      ...prev,
      [event]: [...(prev[event] || []), callback]
    }));
  };

  // Unsubscribe from custom events
  const unsubscribe = (event: string, callback: (data: any) => void) => {
    setListeners(prev => ({
      ...prev,
      [event]: (prev[event] || []).filter(cb => cb !== callback)
    }));
  };

  // Send custom event
  const send = (event: string, data: any) => {
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent(event, { detail: data }));
  };

  // Listen for custom events
  useEffect(() => {
    const handleCustomEvent = (event: CustomEvent) => {
      const eventType = event.type;
      if (listeners[eventType]) {
        listeners[eventType].forEach(callback => callback(event.detail));
      }
    };

    // Add event listeners for all registered event types
    Object.keys(listeners).forEach(eventType => {
      window.addEventListener(eventType, handleCustomEvent as EventListener);
    });

    return () => {
      Object.keys(listeners).forEach(eventType => {
        window.removeEventListener(eventType, handleCustomEvent as EventListener);
      });
    };
  }, [listeners]);

  return (
    <WebSocketContext.Provider value={{ subscribe, unsubscribe, send, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};
