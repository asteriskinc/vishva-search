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
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize WebSocket connection
  useEffect(() => {
    let isCurrentMount = true;

    const setupWebSocket = () => {
      // Clear any existing connection
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      // Clear any pending reconnection
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      try {
        const ws = new WebSocket(`ws://localhost:8000/api/task-execution/${task.task_id}`);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isCurrentMount) {
            console.log(`WebSocket connected for task ${task.task_id}`);
            setIsConnected(true);
            setError(null);
          }
        };

        ws.onclose = () => {
          if (isCurrentMount) {
            console.log(`WebSocket disconnected for task ${task.task_id}`);
            setIsConnected(false);
            // Only attempt reconnect if component is still mounted
            reconnectTimeoutRef.current = setTimeout(setupWebSocket, 3000);
          }
        };

        ws.onerror = (error) => {
          if (isCurrentMount) {
            console.error(`WebSocket error for task ${task.task_id}:`, error);
            setError('Failed to connect to server');
            setIsConnected(false);
          }
        };

        ws.onmessage = (event) => {
          if (isCurrentMount) {
            try {
              const message: WebSocketMessage = JSON.parse(event.data);
              console.log(`Received message for task ${task.task_id}:`, message);

              switch (message.type) {
                case 'EXECUTION_STATUS':
                  setExecutionStatus(message.payload.status);
                  setIsExecuting(false);
                  break;
                default:
                  console.log('Unhandled message type:', message.type);
              }
            } catch (err) {
              console.error('Error processing message:', err);
            }
          }
        };
      } catch (err) {
        if (isCurrentMount) {
          console.error('Error creating WebSocket:', err);
          setError('Failed to create WebSocket connection');
        }
      }
    };

    setupWebSocket();

    // Cleanup function
    return () => {
      isCurrentMount = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        console.log(`Cleaning up WebSocket for task ${task.task_id}`);
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [task.task_id]); // Only depend on task.task_id

  const executeTask = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('WebSocket not connected');
      return;
    }

    setIsExecuting(true);
    const message: WebSocketMessage = {
      type: 'START_EXECUTION',
      payload: {
        taskId: task.task_id,
        subtasks: task.subtasks.map(subtask => ({
          subtask_id: subtask.subtask_id,
          category: subtask.category
        }))
      }
    };

    wsRef.current.send(JSON.stringify(message));
  }, [task]);

  return {
    isConnected,
    error,
    executionStatus,
    isExecuting,
    executeTask
  };
};