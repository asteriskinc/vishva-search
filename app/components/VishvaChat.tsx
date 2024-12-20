import React, { useEffect, useRef, useState } from 'react';
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { Chip } from "@nextui-org/chip";
import { Divider } from "@nextui-org/divider";
import { Tooltip } from "@nextui-org/tooltip";
import { Spinner } from "@nextui-org/spinner";
import { Code } from "@nextui-org/code";
import MarkdownRenderer from './MarkdownRenderer';

interface SystemEvent {
  type: 'tool_call' | 'agent_switch' | 'agent_start';
  agent: string;
  data?: any;
  id: number;
}

interface ChatMessage {
  type: 'user_message' | 'agent_content' | 'error';
  content?: string;
  agent?: string;
  timestamp: number;
  data?: {
    message?: string;
  };
}

const VishvaChat = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [systemEvents, setSystemEvents] = useState<SystemEvent[]>([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const eventsBottomRef = useRef<HTMLDivElement>(null);
  const currentAgentRef = useRef<string | null>(null);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    eventsBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, systemEvents]);

  const connectWebSocket = () => {
    ws.current = new WebSocket('ws://localhost:8000/ws');

    ws.current.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket Connected');
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket Disconnected');
      setTimeout(connectWebSocket, 3000);
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'tool_call' || data.type === 'agent_switch' || data.type === 'agent_start') {
        setSystemEvents(prev => [...prev, { ...data, id: Date.now() }]);
        return;
      }

      setMessages(prev => {
        const newMessages = [...prev];
        
        switch (data.type) {
          case 'content':
            const lastMessageIndex = newMessages.findLastIndex(
              msg => msg.agent === data.agent && msg.type === 'agent_content'
            );

            if (lastMessageIndex !== -1 && currentAgentRef.current === data.agent) {
              newMessages[lastMessageIndex] = {
                ...newMessages[lastMessageIndex],
                content: newMessages[lastMessageIndex].content + data.data.content
              };
            } else {
              currentAgentRef.current = data.agent;
              newMessages.push({
                type: 'agent_content',
                agent: data.agent,
                content: data.data.content,
                timestamp: data.timestamp
              });
            }
            break;

          case 'agent_complete':
            currentAgentRef.current = null;
            break;

          case 'conversation_complete':
          case 'error':
            setIsProcessing(false);
            if (data.type === 'error') newMessages.push(data);
            break;

          default:
            if (data.type === 'user_message') newMessages.push(data);
        }
        
        return newMessages;
      });
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || !isConnected) return;

    if (input.toLowerCase() === 'clear') {
      if (!ws.current) return;
      ws.current.send(JSON.stringify({ action: "clear_history" }));
      setMessages([]);
      setSystemEvents([]);
      setInput("");
      currentAgentRef.current = null;
      return;
    }

    const message = {
      action: "start_search",
      query: input
    };

    if (!ws.current) return;
    ws.current.send(JSON.stringify(message));
    setMessages(prev => [...prev, {
      type: 'user_message',
      content: input,
      timestamp: Date.now() / 1000
    }]);
    setInput("");
    setIsProcessing(true);
  };

  const renderMessage = (message: ChatMessage, index: number) => {
    const getTime = (timestamp) => {
      return new Date(timestamp * 1000).toLocaleTimeString();
    };

    switch (message.type) {
      case 'user_message':
        return (
          <div key={index} className="flex justify-end mb-4">
            <div className="max-w-[80%]">
              <Card className="bg-gray-800">
                <CardBody className="py-3 px-4">
                  <p className="text-white">{message.content}</p>
                </CardBody>
              </Card>
              <span className="text-xs text-gray-400 mt-1 block text-right">
                {getTime(message.timestamp)}
              </span>
            </div>
          </div>
        );

      case 'agent_content':
        return (
            <div key={index} className="flex mb-4">
              <div className="max-w-[80%]">
                <Card>
                  <CardHeader className="py-2 px-4">
                    <span className="text-sm font-semibold">{message.agent}</span>
                  </CardHeader>
                  <CardBody className="py-3 px-4 border-t border-divider">
                    <MarkdownRenderer content={message.content} />
                  </CardBody>
                </Card>
              </div>
            </div>
          );

      case 'error':
        return (
          <div key={index} className="my-2">
            <Card className="bg-danger-100 dark:bg-danger-900">
              <CardBody>
                <p className="text-danger">Error: {message.data.message}</p>
              </CardBody>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const renderSystemEvent = (event) => {
    switch (event.type) {
      case 'tool_call':
        return (
          <div key={event.id} className="mb-2">
            <Card className="bg-default-50">
              <CardBody className="py-2 px-3">
                <div className="text-xs">
                  <span className="font-semibold text-warning">{event.agent}</span>
                  <span className="mx-1">→</span>
                  <span className="font-mono">{event.data.tool}</span>
                  {event.data.arguments && (
                    <Code className="mt-1 text-xs block whitespace-pre-wrap">
                      {JSON.stringify(event.data.arguments, null, 2)}
                    </Code>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        );

      case 'agent_switch':
        return (
          <div key={event.id} className="mb-2">
            <Card className="bg-secondary-50">
              <CardBody className="py-2 px-3">
                <div className="text-xs">
                  <span className="font-semibold">Switching to</span>
                  <span className="ml-1 text-secondary">{event.agent}</span>
                </div>
              </CardBody>
            </Card>
          </div>
        );

      case 'agent_start':
        return (
          <div key={event.id} className="mb-2">
            <Card className="bg-primary-50">
              <CardBody className="py-2 px-3">
                <div className="text-xs">
                  <span className="font-semibold text-primary">{event.agent}</span>
                  <span className="ml-1">started</span>
                </div>
              </CardBody>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex gap-4 w-full max-w-7xl mx-auto h-full">
      <Card className="flex-1 min-w-0">
        <CardHeader className="flex justify-between items-center px-4 py-3">
          <h2 className="text-lg font-semibold">Vishva Search Interface</h2>
          <Chip
            variant="flat"
            color={isConnected ? "success" : "danger"}
            size="sm"
          >
            {isConnected ? "Connected" : "Disconnected"}
          </Chip>
        </CardHeader>
        
        <CardBody className="p-4 flex flex-col gap-4">
          <ScrollShadow className="flex-grow overflow-y-auto">
            <div className="space-y-4">
              {messages.map((msg, index) => renderMessage(msg, index))}
              <div ref={chatBottomRef} />
            </div>
          </ScrollShadow>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your search query..."
              disabled={!isConnected || isProcessing}
              className="flex-grow"
              classNames={{
                input: "text-default-900 dark:text-default-100",
                inputWrapper: "dark:bg-default-100/10"
              }}
              endContent={isProcessing && <Spinner size="sm" />}
            />
            <Button
              color="primary"
              type="submit"
              disabled={!isConnected || isProcessing}
            >
              Send
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card className="w-80 shrink-0">
        <CardHeader className="px-4 py-3">
          <h3 className="text-sm font-semibold">System Events</h3>
        </CardHeader>
        <CardBody className="p-4">
          <ScrollShadow className="h-[calc(80vh-5rem)] overflow-y-auto">
            <div className="space-y-2">
              {systemEvents.map(event => renderSystemEvent(event))}
              <div ref={eventsBottomRef} />
            </div>
          </ScrollShadow>
        </CardBody>
      </Card>
    </div>
  );
};

export default VishvaChat;