// hooks/useTaskWebSocket.ts
import { useState, useCallback, useEffect } from 'react';
import { Task, TaskStatus } from '@/types/types';
import { useWebSocket } from '@/contexts/WebSocketContext';


interface BaseWebSocketMessage {
  type: string;
  payload: Record<string, unknown>;
}

interface SubtaskUpdateMessage extends BaseWebSocketMessage {
  type: 'SUBTASK_UPDATE';
  payload: {
    subtask_id: string;
    status: TaskStatus;
  };
}

interface ExecutionStatusMessage extends BaseWebSocketMessage {
  type: 'EXECUTION_STATUS';
  payload: {
    status: TaskStatus;
  };
}

interface ErrorMessage extends BaseWebSocketMessage {
  type: 'ERROR';
  payload: {
    message: string;
  };
}

type WebSocketMessage = SubtaskUpdateMessage | ExecutionStatusMessage | ErrorMessage;


export const useTaskWebSocket = (task: Task) => {
  const { connect, disconnect, sendMessage, subscribe } = useWebSocket();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executionStatus, setExecutionStatus] = useState<TaskStatus>(task.status);
  const [isExecuting, setIsExecuting] = useState(false);
  const [subtaskStatuses, setSubtaskStatuses] = useState<Record<string, TaskStatus>>({});

  useEffect(() => {
    // Initial connection
    setIsConnected(true);
    connect(task.task_id);

    // Subscribe to messages
    const unsubscribe = subscribe(task.task_id, (message: WebSocketMessage) => {
      console.log(`[useTaskWebSocket] Received message for task ${task.task_id}:`, message);

      try {
        switch (message.type) {
          case 'EXECUTION_STATUS':
            setExecutionStatus(message.payload.status || TaskStatus.PENDING);
            if (message.payload.status === TaskStatus.COMPLETED || 
                message.payload.status === TaskStatus.FAILED) {
              setIsExecuting(false);
            }
            break;

          case 'SUBTASK_UPDATE':
            if (message.payload.subtask_id && message.payload.status) {
              setSubtaskStatuses(prev => ({
                ...prev,
                [message.payload.subtask_id]: message.payload.status
              }));
            }
            break;

          case 'ERROR':
            setError(message.payload.message || 'An unknown error occurred');
            setIsExecuting(false);
            break;
        }
      } catch (err) {
        console.error('[useTaskWebSocket] Error processing message:', err);
        setError('Error processing server message');
      }
    });

    // Cleanup on unmount
    return () => {
      console.log(`[useTaskWebSocket] Cleaning up WebSocket for task ${task.task_id}`);
      unsubscribe();
      disconnect(task.task_id);
      setIsConnected(false);
    };
  }, [task.task_id, connect, disconnect, subscribe]);

  const executeTask = useCallback(() => {
    if (!isConnected) {
      setError('Not connected to server');
      return;
    }

    // Reset states
    setError(null);
    setIsExecuting(true);
    setSubtaskStatuses({});

    // Get executable subtasks (direct tasks only)
    const executableSubtasks = task.subtasks
      .filter(subtask => subtask.category === 1)
      .map(subtask => ({
        subtask_id: subtask.subtask_id,
        category: subtask.category
      }));

    console.log('[useTaskWebSocket] Executable subtasks:', executableSubtasks);

    // Send execution message
    try {
      sendMessage(task.task_id, {
        type: 'START_EXECUTION',
        payload: {
          taskId: task.task_id,
          subtasks: executableSubtasks
        }
      });
    } catch (err) {
      console.error('[useTaskWebSocket] Error sending execution message:', err);
      setError('Failed to start task execution');
      setIsExecuting(false);
    }
  }, [task, isConnected, sendMessage]);

  const getSubtaskStatus = useCallback((subtaskId: string) => {
    return subtaskStatuses[subtaskId] || TaskStatus.PENDING;
  }, [subtaskStatuses]);

  return {
    isConnected,
    error,
    executionStatus,
    isExecuting,
    executeTask,
    getSubtaskStatus,
    subtaskStatuses
  };
};