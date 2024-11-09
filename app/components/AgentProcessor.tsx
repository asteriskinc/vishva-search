// @ts-nocheck
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  CardFooter,
  Button,
  Progress,
  Chip,
  Avatar
} from "@nextui-org/react";
import { Search, Map, Ticket, PlayCircle, Clock, Building2 } from 'lucide-react';
import { getWebSocketUrl, WebSocketStatus } from '../../utils/websocket';

interface ProcessingStatus {
  step: string;
  message: string;
  progress: number;
}

interface Theater {
  name: string;
  distance: string;
  nextShowtime: string;
}

interface Agent {
  name: string;
  currentTask: string;
}

interface WebSocketMessage {
  type: 'agent_update' | 'task_complete' | 'error';
  data: {
    agent?: Agent;
    status?: string;
    theaters?: Theater[];
    taskId?: string;
    message?: string;
  };
  timestamp: string;
}

const AgentProcessor = () => {
  const [status, setStatus] = useState<string | null>(null);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [theaterOptions, setTheaterOptions] = useState<Theater[]>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<WebSocketStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const mountedRef = useRef<boolean>(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const taskFlow = [
    {
      id: 'intent',
      title: 'Understanding Intent',
      icon: Search,
      description: 'Analyzing your search query'
    },
    {
      id: 'availability',
      title: 'Checking Availability',
      icon: PlayCircle,
      description: 'Finding where to watch'
    },
    {
      id: 'theaters',
      title: 'Finding Theaters',
      icon: Ticket,
      description: 'Locating nearby theaters'
    },
    {
      id: 'directions',
      title: 'Getting Directions',
      icon: Map,
      description: 'Planning your route'
    }
  ];

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || !mountedRef.current) {
      return;
    }

    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      setError('Maximum reconnection attempts reached. Please refresh the page.');
      return;
    }

    const wsUrl = getWebSocketUrl();
    console.log(`Connecting to WebSocket at: ${wsUrl} (Attempt ${reconnectAttemptsRef.current + 1}/${MAX_RECONNECT_ATTEMPTS})`);
    
    setConnectionStatus('connecting');
    setError(null);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      if (mountedRef.current) {
        console.log('Connected to WebSocket');
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        setError(null);
        
        // Start the search process once connected
        ws.send(JSON.stringify({
          action: 'start_search',
          query: 'Where to watch smile 2?',
          timestamp: new Date().toISOString()
        }));
      }
    };

    ws.onmessage = (event) => {
      if (!mountedRef.current) return;
      
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log('Received message:', message);
        
        switch (message.type) {
          case 'agent_update':
            if (message.data.agent) {
              setCurrentAgent(message.data.agent);
            }
            if (message.data.status) {
              setStatus(message.data.status);
            }
            if (message.data.theaters) {
              setTheaterOptions(message.data.theaters);
            }
            break;
            
          case 'task_complete':
            if (message.data.taskId) {
              setCompletedTasks(prev => [...prev, message.data.taskId]);
            }
            break;
            
          case 'error':
            if (message.data.message) {
              setError(message.data.message);
            }
            break;
        }
      } catch (e) {
        console.error('Error parsing message:', e);
        setError('Error processing server message');
      }
    };

    ws.onclose = (event) => {
      if (!mountedRef.current) return;

      console.log('WebSocket closed with code:', event.code);
      setConnectionStatus('disconnected');
      wsRef.current = null;

      // Attempt to reconnect
      if (mountedRef.current && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttemptsRef.current += 1;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            connectWebSocket();
          }
        }, delay);
      }
    };

    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
      setError('Connection error occurred');
    };

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connectWebSocket();

    return () => {
      mountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  const getProgressValue = () => {
    return (completedTasks.length / taskFlow.length) * 100;
  };


  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Connection Status */}
      <Card 
        className={connectionStatus === 'connected' ? 'border-success' : 'border-warning'}
        shadow="sm"
      >
        <CardBody className="flex flex-row items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus === 'connected' ? 'bg-success' : 
            connectionStatus === 'connecting' ? 'bg-warning' : 
            'bg-danger'
          }`} />
          <p>Status: {connectionStatus}</p>
        </CardBody>
      </Card>

      {/* Overall Progress */}
      <Card shadow="sm">
        <CardHeader className="flex flex-col items-start gap-2">
          <h4 className="text-lg font-semibold">Search Progress</h4>
          <p className="text-default-500">Processing: "Where to watch smile 2?"</p>
        </CardHeader>
        <CardBody>
          <Progress 
            value={getProgressValue()} 
            className="w-full"
            size="md"
            color="primary"
            showValueLabel
          />
        </CardBody>
      </Card>

      {/* Task Flow Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {taskFlow.map((task, index) => {
          const Icon = task.icon;
          const isCompleted = completedTasks.includes(task.id);
          const isCurrent = currentAgent?.currentTask === task.id;
          
          return (
            <Card 
              key={task.id} 
              shadow="sm"
              className={`border-2 ${
                isCompleted ? 'border-success' : 
                isCurrent ? 'border-primary' : 
                'border-default'
              }`}
            >
              <CardBody className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-full ${
                    isCompleted ? 'bg-success/10 text-success' : 
                    isCurrent ? 'bg-primary/10 text-primary' : 
                    'bg-default/10 text-default-500'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h5 className="text-sm font-medium">{task.title}</h5>
                </div>
                <p className="text-sm text-default-500">{task.description}</p>
                {(isCompleted || isCurrent) && (
                  <Chip 
                    color={isCompleted ? "success" : "primary"}
                    variant="flat"
                    size="sm"
                  >
                    {isCompleted ? "Complete" : "In Progress"}
                  </Chip>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Current Status */}
      {status && (
        <Card shadow="sm">
          <CardBody className="flex flex-row items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"/>
            <div>
              <h5 className="text-lg font-semibold">{currentAgent?.name || 'Processing'}</h5>
              <p className="text-default-500">{status}</p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Theater Options */}
      {theaterOptions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {theaterOptions.map((theater, index) => (
            <Card key={index} shadow="sm">
              <CardHeader className="flex justify-between">
                <div>
                  <h4 className="text-lg font-semibold">{theater.name}</h4>
                  <p className="text-small text-default-500">Next available showing</p>
                </div>
                <Avatar
                  icon={<Building2 className="w-5 h-5" />}
                  classNames={{
                    base: "bg-default/10",
                    icon: "text-default-500"
                  }}
                />
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{theater.nextShowtime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Map className="w-4 h-4 text-success" />
                  <span className="text-sm">{theater.distance}</span>
                </div>
              </CardBody>
              <CardFooter>
                <Button 
                  color="primary" 
                  className="w-full"
                >
                  Book Tickets
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Card shadow="sm" className="border-danger">
          <CardBody>
            <h5 className="text-lg font-semibold text-danger">Error</h5>
            <p className="text-danger">{error}</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default AgentProcessor;