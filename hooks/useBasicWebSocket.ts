// hooks/useBasicWebSocket.ts
import { useState, useEffect, useRef } from 'react';

export const useBasicWebSocket = (taskId: string) => {
  const [message, setMessage] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // If we already have an active connection, don't create another one
    if (wsRef.current?.readyState === WebSocket.OPEN || 
        wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    // Create WebSocket connection
    const ws = new WebSocket(`ws://localhost:8000/api/ws-test/${taskId}`);
    wsRef.current = ws;

    // Connection opened
    ws.onopen = () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
    };

    // Listen for messages
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessage(data);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setIsConnected(false);
      wsRef.current = null;
    };

    // Clean up on unmount
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [taskId]); // Only reconnect if taskId changes

  // Function to send a test message
  const sendMessage = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "TEST" }));
    }
  };

  return { sendMessage, message, isConnected };
}