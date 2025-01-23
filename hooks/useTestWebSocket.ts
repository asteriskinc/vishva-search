// hooks/useTestWebSocket.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { Task } from '@/types/types';

interface WebSocketMessage {
  type: string;
  payload: any;
}

interface Props {
  task: Task;
  onMessage?: (message: WebSocketMessage) => void;
}

// Singleton WebSocket connections store
const webSockets: Map<string, {
  socket: WebSocket;
  refCount: number;
  listeners: Set<(message: WebSocketMessage) => void>;
}> = new Map();

export const useTestWebSocket = ({ task, onMessage }: Props) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  
  useEffect(() => {
    let ws: WebSocket;
    
    const handleMessage = (message: WebSocketMessage) => {
      setLastMessage(message);
      onMessage?.(message);
    };

    // Try to get existing connection
    let connection = webSockets.get(task.task_id);

    if (!connection) {
      // Create new connection if none exists
      ws = new WebSocket(`ws://localhost:8000/api/ws-test/${task.task_id}`);
      connection = {
        socket: ws,
        refCount: 0,
        listeners: new Set()
      };
      webSockets.set(task.task_id, connection);

      ws.onopen = () => {
        console.log(`WebSocket connected for task ${task.task_id}`);
        setIsConnected(true);
        setError(null);
      };

      ws.onclose = () => {
        console.log(`WebSocket closed for task ${task.task_id}`);
        setIsConnected(false);
        webSockets.delete(task.task_id);
      };

      ws.onerror = (error) => {
        console.error(`WebSocket error for task ${task.task_id}:`, error);
        setError('Failed to connect to server');
        setIsConnected(false);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log(`Received message for task ${task.task_id}:`, message);
          // Notify all listeners
          connection?.listeners.forEach(listener => listener(message));
        } catch (err) {
          console.error('Error processing message:', err);
        }
      };
    } else {
      ws = connection.socket;
      if (ws.readyState === WebSocket.OPEN) {
        setIsConnected(true);
      }
    }

    // Add listener and increment ref count
    connection.listeners.add(handleMessage);
    connection.refCount++;

    // Cleanup
    return () => {
      const conn = webSockets.get(task.task_id);
      if (conn) {
        conn.listeners.delete(handleMessage);
        conn.refCount--;
        
        // Only close and remove connection if no more references
        if (conn.refCount === 0) {
          console.log(`Closing last connection for task ${task.task_id}`);
          conn.socket.close();
          webSockets.delete(task.task_id);
        }
      }
    };
  }, [task.task_id, onMessage]);

  const sendTestMessage = useCallback(() => {
    const connection = webSockets.get(task.task_id);
    if (!connection || connection.socket.readyState !== WebSocket.OPEN) {
      setError('WebSocket not connected');
      return;
    }

    const message: WebSocketMessage = {
      type: 'START_EXECUTION',
      payload: {
        taskId: task.task_id,
        test: true
      }
    };

    connection.socket.send(JSON.stringify(message));
  }, [task.task_id]);

  return {
    isConnected,
    error,
    lastMessage,
    sendTestMessage
  };
};