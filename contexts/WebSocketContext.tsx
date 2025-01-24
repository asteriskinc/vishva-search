// contexts/WebSocketContext.tsx
"use client"
import React, { createContext, useContext, useCallback, useRef } from 'react';
import { TaskStatus } from '@/types/types';

interface WebSocketContextType {
  connect: (taskId: string) => void;
  disconnect: (taskId: string) => void;
  sendMessage: (taskId: string, message: any) => void;
  subscribe: (taskId: string, callback: (message: any) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const connectionsRef = useRef<Map<string, WebSocket>>(new Map());
  const subscribersRef = useRef<Map<string, Set<(message: any) => void>>>(new Map());

  const connect = useCallback((taskId: string) => {
    if (connectionsRef.current.has(taskId)) {
      return;
    }

    const ws = new WebSocket(`ws://localhost:8000/api/task-execution/${taskId}`);
    connectionsRef.current.set(taskId, ws);
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const subscribers = subscribersRef.current.get(taskId);
      subscribers?.forEach(callback => callback(message));
    };

    ws.onclose = () => {
      connectionsRef.current.delete(taskId);
      subscribersRef.current.delete(taskId);
    };
  }, []);

  const disconnect = useCallback((taskId: string) => {
    const ws = connectionsRef.current.get(taskId);
    if (ws) {
      ws.close();
      connectionsRef.current.delete(taskId);
      subscribersRef.current.delete(taskId);
    }
  }, []);

  const sendMessage = useCallback((taskId: string, message: any) => {
    const ws = connectionsRef.current.get(taskId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }, []);

  const subscribe = useCallback((taskId: string, callback: (message: any) => void) => {
    if (!subscribersRef.current.has(taskId)) {
      subscribersRef.current.set(taskId, new Set());
    }
    
    subscribersRef.current.get(taskId)?.add(callback);
    
    return () => {
      subscribersRef.current.get(taskId)?.delete(callback);
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ connect, disconnect, sendMessage, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};