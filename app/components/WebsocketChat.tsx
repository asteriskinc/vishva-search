import React, { useEffect, useRef, useState } from 'react';
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { Chip } from "@nextui-org/chip";
import { Send, AlertCircle, Wifi, WifiOff } from 'lucide-react';

const WebsocketChat = () => {
  const [messageBlocks, setMessageBlocks] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState('disconnected');
  const [error, setError] = useState('');
  const webSocket = useRef<WebSocket | null>(null);
  const scrollAreaRef = useRef(null);
  
  useEffect(() => {
    connectWebSocket();
    return () => {
      if (webSocket.current) {
        webSocket.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    try {
      webSocket.current = new WebSocket('ws://localhost:8000/ws');
      
      webSocket.current.onopen = () => {
        setStatus('connected');
        setError('');
      };

      webSocket.current.onclose = () => {
        setStatus('disconnected');
        setTimeout(connectWebSocket, 3000);
      };

      webSocket.current.onerror = (error) => {
        setError('WebSocket connection error. Please check if the server is running.');
        setStatus('error');
      };

      webSocket.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleNewMessage(data);
        
        if (scrollAreaRef.current) {
          setTimeout(() => {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
          }, 100);
        }
      };
    } catch (err) {
      setError('Failed to establish WebSocket connection');
      setStatus('error');
    }
  };

  const handleNewMessage = (data) => {
    const { type, agent } = data;

    switch (type) {
      case 'agent_start':
        // Add agent start message
        setMessageBlocks(prev => [...prev, data]);
        break;

      case 'content':
        setMessageBlocks(prev => {
          const newBlocks = [...prev];
          const lastBlock = newBlocks.findLast(block => 
            block.type === 'content' && block.agent === agent
          );
          
          if (lastBlock) {
            // Update existing content block for this agent
            const lastBlockIndex = newBlocks.lastIndexOf(lastBlock);
            newBlocks[lastBlockIndex] = {
              ...lastBlock,
              data: {
                content: lastBlock.data.content + data.data.content
              }
            };
          } else {
            // Create new content block for this agent
            newBlocks.push({
              type: 'content',
              agent,
              timestamp: data.timestamp,
              data: { content: data.data.content }
            });
          }
          return newBlocks;
        });
        break;

      case 'tool_call':
      case 'agent_complete':
      case 'conversation_complete':
      case 'error':
        // Add these messages directly
        setMessageBlocks(prev => [...prev, data]);
        break;

      default:
        break;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (webSocket.current && webSocket.current.readyState === WebSocket.OPEN) {
      const message = {
        action: "start_search",
        query: inputValue
      };
      setMessageBlocks([]);
      webSocket.current.send(JSON.stringify(message));
      setInputValue('');
    } else {
      setError('WebSocket is not connected. Attempting to reconnect...');
      connectWebSocket();
    }
  };

  const renderMessage = (message) => {
    if (!message) return null;
    
    const { type, agent, timestamp } = message;
    const time = new Date(timestamp * 1000).toLocaleTimeString();

    switch (type) {
      case 'agent_start':
        return (
          <div className="py-2 px-4 bg-blue-950/30 rounded-lg border border-blue-800/50">
            <span className="text-blue-400 font-medium">[{time}] {agent}: </span>
            <span className="text-blue-300">{message.data.message}</span>
          </div>
        );

      case 'content':
        return (
          <div className="py-2">
            <span className="text-emerald-400 font-medium">{agent}: </span>
            <span className="text-foreground whitespace-pre-wrap">{message.data.content}</span>
          </div>
        );

      case 'tool_call':
        return (
          <div className="py-2 px-4 bg-yellow-950/30 rounded-lg border border-yellow-800/50">
            <span className="text-yellow-400 font-medium">[{time}] {agent} called: </span>
            <span className="text-yellow-300">{message.data.tool}</span>
            {message.data.arguments && (
              <div className="mt-1 text-yellow-300/80">
                {JSON.stringify(message.data.arguments, null, 2)}
              </div>
            )}
          </div>
        );

      case 'error':
        return (
          <div className="py-2 px-4 bg-red-950/30 rounded-lg border border-red-800/50">
            <span className="text-red-400 font-medium">[{time}] Error: </span>
            <span className="text-red-300">{message.data.message}</span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto bg-content1">
      <CardHeader className="flex justify-between items-center">
        <h4 className="text-lg font-bold">ORCS Chat Interface</h4>
        <Chip
          startContent={status === 'connected' ? <Wifi size={16} /> : <WifiOff size={16} />}
          color={status === 'connected' ? 'success' : status === 'error' ? 'danger' : 'default'}
          variant="flat"
        >
          {status}
        </Chip>
      </CardHeader>
      <CardBody>
        {error && (
          <div className="mb-4 p-4 bg-red-950/30 rounded-lg border border-red-800/50 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <span className="text-red-300">{error}</span>
          </div>
        )}
        
        <ScrollShadow 
          ref={scrollAreaRef}
          className="h-[500px] mb-4"
          hideScrollBar
        >
          <div className="space-y-2 px-1">
            {messageBlocks.map((msg, idx) => (
              <div key={idx}>{renderMessage(msg)}</div>
            ))}
          </div>
        </ScrollShadow>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter your query..."
            className="flex-1"
          />
          <Button
            type="submit"
            color="primary"
            isDisabled={status !== 'connected'}
            endContent={<Send className="h-4 w-4" />}
          >
            Send
          </Button>
        </form>
      </CardBody>
    </Card>
  );
};

export default WebsocketChat;