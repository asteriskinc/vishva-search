// hooks/useTaskWebSocket.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { Task, TaskStatus } from '@/types/types';

interface WebSocketMessage {
  type: string;
  payload?: any;
}

export const useTaskWebSocket = (task: Task) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executionStatus, setExecutionStatus] = useState<TaskStatus>(task.status);
  const [isExecuting, setIsExecuting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef<number>(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const messageQueueRef = useRef<WebSocketMessage[]>([]);
  const isReconnectingRef = useRef(false);

  const connect = useCallback(() => {
    // Don't create a new connection if we already have one
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    // Clear any existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    try {
      const ws = new WebSocket(`ws://localhost:8000/api/task-execution/${task.task_id}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log(`[useTaskWebSocket] WebSocket connected for task ${task.task_id}`);
        setIsConnected(true);
        setError(null);
        reconnectAttemptRef.current = 0;
        isReconnectingRef.current = false;

        // Send any queued messages
        while (messageQueueRef.current.length > 0) {
          const message = messageQueueRef.current.shift();
          if (message) {
            ws.send(JSON.stringify(message));
          }
        }
      };

      ws.onclose = (event) => {
        console.log(`[useTaskWebSocket] WebSocket disconnected for task ${task.task_id}`);
        setIsConnected(false);

        // Only attempt reconnect if not manually closed and not already reconnecting
        if (!event.wasClean && !isReconnectingRef.current) {
          handleReconnect();
        }
      };

      ws.onerror = (error) => {
        console.error(`[useTaskWebSocket] WebSocket error for task ${task.task_id}:`, error);
        setError('Failed to connect to server');
        setIsConnected(false);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log(`[useTaskWebSocket] Received message for task ${task.task_id}:`, message);

          switch (message.type) {
            case 'EXECUTION_STATUS':
              setExecutionStatus(message.payload.status);
              setIsExecuting(false);
              break;
            case 'SUBTASK_UPDATE':
              // Handle subtask updates
              if (message.payload.subtask_id) {
                // Update specific subtask status
                const subtaskId = message.payload.subtask_id;
                const status = message.payload.status;
                // You might want to emit an event or callback here
              }
              break;
            default:
              console.log('[useTaskWebSocket] Unhandled message type:', message.type);
          }
        } catch (err) {
          console.error('[useTaskWebSocket] Error processing message:', err);
        }
      };
    } catch (err) {
      console.error('[useTaskWebSocket] Error creating WebSocket:', err);
      setError('Failed to create WebSocket connection');
    }
  }, [task.task_id]);

  const handleReconnect = useCallback(() => {
    if (reconnectAttemptRef.current >= maxReconnectAttempts) {
      console.log('[useTaskWebSocket] Max reconnection attempts reached');
      return;
    }

    isReconnectingRef.current = true;
    const timeout = Math.min(1000 * Math.pow(2, reconnectAttemptRef.current), 10000);
    
    console.log(`[useTaskWebSocket] Attempting to reconnect in ${timeout}ms`);
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttemptRef.current++;
      connect();
    }, timeout);
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      isReconnectingRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      // Queue message if socket is not ready
      messageQueueRef.current.push(message);
      if (!isReconnectingRef.current) {
        connect();
      }
      return;
    }

    try {
      wsRef.current.send(JSON.stringify(message));
    } catch (err) {
      console.error('[useTaskWebSocket] Error sending message:', err);
      messageQueueRef.current.push(message);
    }
  }, [connect]);

  const executeTask = useCallback(() => {
    setIsExecuting(true);
    const executableSubtasks = task.subtasks
      .filter(subtask => subtask.category === 1)
      .map(subtask => ({
        subtask_id: subtask.subtask_id,
        category: subtask.category
      }));

    console.log('[useTaskWebSocket] Executable subtasks:', executableSubtasks);

    const message: WebSocketMessage = {
      type: 'START_EXECUTION',
      payload: {
        taskId: task.task_id,
        subtasks: executableSubtasks
      }
    };

    sendMessage(message);
  }, [task, sendMessage]);

  return {
    isConnected,
    error,
    executionStatus,
    isExecuting,
    executeTask
  };
};