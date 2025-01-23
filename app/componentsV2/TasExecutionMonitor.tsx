import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { Terminal, Wifi, WifiOff, AlertCircle } from "lucide-react";

interface TaskUpdate {
  type: string;
  payload?: {
    timestamp?: string;
    message?: string;
    subtask_id?: string;
    [key: string]: any;
  };
}

interface TaskExecutionMonitorProps {
  taskId: string;
}

const TaskExecutionMonitor: React.FC<TaskExecutionMonitorProps> = ({ taskId }) => {
  const [updates, setUpdates] = useState<TaskUpdate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const connect = () => {
      const websocket = new WebSocket(`ws://localhost:8000/api/task-execution/${taskId}`);

      websocket.onopen = () => {
        console.log('WebSocket Connected');
        setConnected(true);
        setError(null);
      };

      websocket.onclose = () => {
        console.log('WebSocket Disconnected');
        setConnected(false);
      };

      websocket.onerror = (error) => {
        console.error('WebSocket Error:', error);
        setError('Failed to connect to server');
        setConnected(false);
      };

      websocket.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          console.log('Received update:', update);
          setUpdates(prev => [...prev, update]);
        } catch (err) {
          console.error('Error processing message:', err);
        }
      };

      setWs(websocket);
    };

    connect();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [taskId]);

  return (
    <Card 
      className="backdrop-blur-xl bg-white/5 border border-white/20"
      radius="lg"
    >
      <CardHeader className="flex justify-between gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-white/80" />
          <span className="text-white/90 font-medium">Execution Monitor</span>
        </div>
        <div className="flex items-center gap-2">
          {connected ? (
            <Wifi className="w-4 h-4 text-green-400" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-400" />
          )}
          <span className="text-sm text-white/60">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </CardHeader>

      <CardBody className="gap-3">
        {error && (
          <div className="flex items-center gap-2 p-3 backdrop-blur-xl bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400">{error}</span>
          </div>
        )}

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {updates.map((update, index) => (
            <div 
              key={index}
              className="p-3 backdrop-blur-xl bg-white/5 border border-white/20 rounded-lg"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white/80">
                    {update.type}
                  </span>
                  {update.payload?.timestamp && (
                    <span className="text-xs text-white/40">
                      {new Date(update.payload.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                <div className="text-sm text-white/60">
                  {update.payload?.message || JSON.stringify(update.payload)}
                </div>
                {update.payload?.subtask_id && (
                  <div className="text-xs text-white/40">
                    Subtask ID: {update.payload.subtask_id}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default TaskExecutionMonitor;