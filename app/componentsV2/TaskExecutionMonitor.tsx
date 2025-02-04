// components/TaskExecutionMonitor.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, ScrollShadow } from "@nextui-org/react";
import { Terminal, Wifi, WifiOff, AlertCircle, CheckCircle2, CircleDot, XCircle } from "lucide-react";
import { TaskStatus } from '@/types/types';
import { useWebSocket } from '@/contexts/WebSocketContext';

interface TaskUpdate {
  type: string;
  payload: {
    timestamp?: string;
    message?: string;
    subtask_id?: string | null;
    status?: TaskStatus;
  };
}

interface TaskExecutionMonitorProps {
  taskId: string;
  isConnected: boolean;
  error: string | null;
}

const TaskExecutionMonitor: React.FC<TaskExecutionMonitorProps> = ({ 
  taskId,
  isConnected,
  error
}) => {
  const [updates, setUpdates] = useState<TaskUpdate[]>([]);
  const { subscribe } = useWebSocket();

  useEffect(() => {
    // Subscribe to WebSocket messages
    const unsubscribe = subscribe(taskId, (update: TaskUpdate) => {
      console.log('Monitor received update:', update);
      setUpdates(prev => [...prev, update]);
    });

    return () => {
      unsubscribe();
    };
  }, [taskId, subscribe]);

  const getStatusIcon = (status?: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case TaskStatus.IN_PROGRESS:
        return <CircleDot className="w-4 h-4 text-blue-400" />;
      case TaskStatus.FAILED:
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <CircleDot className="w-4 h-4 text-white/40" />;
    }
  };

  return (
    <Card className="backdrop-blur-xl bg-white/5 border border-white/20" radius="lg">
      <CardHeader className="flex justify-between gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-white/80" />
          <span className="text-white/90 font-medium">Execution Monitor</span>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="w-4 h-4 text-green-400" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-400" />
          )}
          <span className="text-sm text-white/60">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </CardHeader>

      <CardBody>
        {error && (
          <div className="flex items-center gap-2 p-3 backdrop-blur-xl bg-red-500/10 border border-red-500/20 rounded-lg mb-3">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400">{error}</span>
          </div>
        )}

        <ScrollShadow className="h-64">
          <div className="space-y-2">
            {updates.map((update, index) => (
              <div 
                key={index}
                className="p-3 backdrop-blur-xl bg-white/5 border border-white/20 rounded-lg"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(update.payload.status)}
                      <span className="text-sm font-medium text-white/80">
                        {update.type === 'SUBTASK_UPDATE' ? 'Subtask Update' : update.type}
                      </span>
                    </div>
                    {update.payload.timestamp && (
                      <span className="text-xs text-white/40">
                        {new Date(update.payload.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-white/60 mt-1">
                    {update.payload.message}
                  </div>
                  {update.payload.subtask_id && (
                    <div className="text-xs text-white/40 mt-1">
                      ID: {update.payload.subtask_id}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollShadow>
      </CardBody>
    </Card>
  );
};

export default TaskExecutionMonitor;