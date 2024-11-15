'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { Chip } from "@nextui-org/chip";
import { Send, AlertCircle, Wifi, WifiOff, Loader2 } from 'lucide-react';

// Types that match the server's event structure
type AgentEvent = {
  type: 'agent_start' | 'agent_switch' | 'content' | 'tool_call' | 'agent_complete' | 'conversation_complete' | 'info' | 'error';
  agent: string;
  timestamp: number;
  data?: {
    message?: string;
    content?: string;
    tool?: string;
    arguments?: Record<string, any>;
    final_content?: string;
    previous_agent?: string;
    messages?: any[];
    final_agent?: string;
  };
};

type ConnectionStatus = 'connected' | 'disconnected' | 'error';

const WebsocketChat = () => {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string>('');
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const connectWebSocket = () => {
    try {
      wsRef.current = new WebSocket('ws://localhost:8000/ws');

      wsRef.current.onopen = () => {
        setStatus('connected');
        setError('');
      };

      wsRef.current.onclose = () => {
        setStatus('disconnected');
        setIsProcessing(false);
        setTimeout(connectWebSocket, 3000);
      };

      wsRef.current.onerror = () => {
        setError('WebSocket connection error. Please check if the server is running.');
        setStatus('error');
        setIsProcessing(false);
      };

      wsRef.current.onmessage = (event) => {
        const data: AgentEvent = JSON.parse(event.data);
        handleEvent(data);
      };
    } catch (err) {
      setError('Failed to establish WebSocket connection');
      setStatus('error');
      setIsProcessing(false);
    }
  };

  const handleEvent = (event: AgentEvent) => {
    setEvents(prev => [...prev, event]);

    switch (event.type) {
      case 'agent_start':
        setIsProcessing(true);
        break;
      case 'conversation_complete':
      case 'error':
        setIsProcessing(false);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !wsRef.current || status !== 'connected') return;

    if (input.toLowerCase() === 'clear') {
      wsRef.current.send(JSON.stringify({ action: 'clear_history' }));
      setEvents([]);
      setInput('');
      return;
    }

    const message = {
      action: 'start_search',
      query: input
    };

    setEvents([]);  // Clear previous conversation
    wsRef.current.send(JSON.stringify(message));
    setInput('');
  };

  const renderEvent = (event: AgentEvent) => {
    const { type, agent, timestamp, data } = event;
    const time = new Date(timestamp * 1000).toLocaleTimeString();

    switch (type) {
      case 'agent_start':
        return (
          <div className="flex flex-col space-y-1 bg-default-100 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Chip size="sm" color="primary">{agent}</Chip>
              <span className="text-small text-default-500">{time}</span>
            </div>
            <div className="text-default-600">
              🤖 {data?.message || 'Started processing...'}
            </div>
          </div>
        );

      case 'agent_switch':
        return (
          <div className="bg-warning-100 dark:bg-warning-900 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Chip size="sm" color="warning">System</Chip>
              <span className="text-small text-default-500">{time}</span>
            </div>
            <div>
              Switching from {data?.previous_agent} to {agent}
            </div>
          </div>
        );

      case 'content':
        return (
          <div className="flex flex-col space-y-1 bg-default-100 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Chip size="sm" color="primary">{agent}</Chip>
            </div>
            <div className="whitespace-pre-wrap">
              {data?.content}
            </div>
          </div>
        );

      case 'tool_call':
        return (
          <div className="flex flex-col space-y-1 bg-secondary-100 dark:bg-secondary-900 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Chip 
                size="sm" 
                color="secondary" 
                startContent={<span className="text-sm">🔧</span>}
              >
                Tool: {data?.tool}
              </Chip>
              <span className="text-small text-default-500">{time}</span>
            </div>
            <pre className="text-sm bg-black/10 dark:bg-white/10 rounded p-2 overflow-x-auto">
              {JSON.stringify(data?.arguments, null, 2)}
            </pre>
          </div>
        );

      case 'agent_complete':
        return (
          <div className="bg-success-100 dark:bg-success-900 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Chip size="sm" color="success">{agent}</Chip>
              <span className="text-small text-default-500">{time}</span>
            </div>
            <div>✅ Task completed</div>
          </div>
        );

      case 'error':
        return (
          <div className="bg-danger-100 dark:bg-danger-900 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Chip size="sm" color="danger">Error</Chip>
              <span className="text-small text-default-500">{time}</span>
            </div>
            <div className="flex items-center gap-2 text-danger mt-1">
              <AlertCircle className="h-4 w-4" />
              {data?.message}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <Card className="flex-1">
        <CardHeader className="flex justify-between items-center">
          <h4 className="text-lg font-bold">ORCS Chat Interface</h4>
          <Chip
            startContent={status === 'connected' ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            color={status === 'connected' ? 'success' : status === 'error' ? 'danger' : 'default'}
            variant="flat"
          >
            {status}
          </Chip>
        </CardHeader>
        <CardBody>
          {error && (
            <div className="mb-4 p-4 bg-danger-100 dark:bg-danger-900 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-danger" />
              <span className="text-danger">{error}</span>
            </div>
          )}
          
          <ScrollShadow 
            ref={scrollRef}
            className="h-[calc(100vh-220px)] mb-4"
          >
            <div className="space-y-4 p-1">
              {events.map((event, index) => (
                <div key={index}>
                  {renderEvent(event)}
                </div>
              ))}
            </div>
          </ScrollShadow>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={status === 'connected' ? "Type your query or 'clear' to reset..." : "Connecting..."}
              isDisabled={status !== 'connected' || isProcessing}
              size="lg"
              variant="bordered"
              className="flex-1"
            />
            <Button
              type="submit"
              color="primary"
              size="lg"
              className="w-24"
              isDisabled={status !== 'connected' || isProcessing || !input.trim()}
              startContent={isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            >
              Send
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default WebsocketChat;