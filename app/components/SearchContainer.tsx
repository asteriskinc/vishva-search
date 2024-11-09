// @ts-nocheck
'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Map, Ticket, PlayCircle } from 'lucide-react';
import Logo from './Logo';
import SearchBar from './SearchBar';
import AgentCard from './AgentCard';
import { Agent, AgentStatus } from '@/types/Agent';
import { getWebSocketUrl, WebSocketStatus } from '@/utils/websocket';

const agents: Record<string, Agent> = {
  intent: {
    title: 'Understanding Intent',
    description: 'Analyzing your search query',
    icon: Search,
  },
  availability: {
    title: 'Checking Availability',
    description: 'Finding where to watch',
    icon: PlayCircle,
  },
  theaters: {
    title: 'Finding Theaters',
    description: 'Locating nearby theaters',
    icon: Ticket,
  },
  directions: {
    title: 'Getting Directions',
    description: 'Planning your route',
    icon: Map,
  },
};

interface WebSocketMessage {
  type: 'agent_update' | 'task_complete' | 'error';
  data: {
    agent?: {
      name: string;
      currentTask: string;
    };
    status?: string;
    theaters?: Array<{
      name: string;
      distance: string;
      nextShowtime: string;
    }>;
    taskId?: string;
    message?: string;
  };
  timestamp: string;
}

interface Theater {
  name: string;
  distance: string;
  nextShowtime: string;
}

const SearchContainer = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeAgents, setActiveAgents] = useState<string[]>([]);
    const [agentStatuses, setAgentStatuses] = useState<Record<string, AgentStatus>>({});
    const [error, setError] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<WebSocketStatus>('disconnected');
    const [theaterOptions, setTheaterOptions] = useState([]);
  
    const wsRef = useRef<WebSocket | null>(null);
    const connectionAttemptRef = useRef<number>(0);
    const maxRetries = 3;
  
    const cleanupWebSocket = useCallback(() => {
      if (wsRef.current) {
        wsRef.current.onclose = null; // Remove close handler to prevent reconnection
        wsRef.current.close();
        wsRef.current = null;
      }
      setConnectionStatus('disconnected');
    }, []);
  
    const connectWebSocket = useCallback(() => {
      // Clean up existing connection if any
      cleanupWebSocket();
  
      if (connectionAttemptRef.current >= maxRetries) {
        setError('Failed to establish connection. Please refresh the page.');
        return;
      }
  
      try {
        const wsUrl = getWebSocketUrl();
        console.log(`Connecting to WebSocket: ${wsUrl}`);
        setConnectionStatus('connecting');
  
        const ws = new WebSocket(wsUrl);
  
        ws.onopen = () => {
          console.log('WebSocket connected');
          setConnectionStatus('connected');
          setError(null);
          connectionAttemptRef.current = 0;
        };
  
        ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code);
          cleanupWebSocket();
          
          // Only attempt reconnect if we haven't exceeded max retries
          if (connectionAttemptRef.current < maxRetries) {
            connectionAttemptRef.current += 1;
            console.log(`Reconnection attempt ${connectionAttemptRef.current}`);
            setTimeout(connectWebSocket, 1000 * connectionAttemptRef.current);
          }
        };
  
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setError('Connection error occurred');
        };
  
        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log('Received message:', message);
  
            switch (message.type) {
              case 'agent_update':
                if (message.data.agent) {
                  const agentId = message.data.agent.currentTask;
                  if (!activeAgents.includes(agentId)) {
                    setActiveAgents(prev => [...prev, agentId]);
                  }
                  setAgentStatuses(prev => ({
                    ...prev,
                    [agentId]: {
                      status: 'processing',
                      message: message.data.status || ''
                    }
                  }));
                }
                if (message.data.theaters) {
                  setTheaterOptions(message.data.theaters);
                }
                break;
  
              case 'task_complete':
                if (message.data.taskId) {
                  setAgentStatuses(prev => ({
                    ...prev,
                    [message.data.taskId]: {
                      status: 'completed',
                      message: message.data.message || ''
                    }
                  }));
                }
                break;
  
              case 'error':
                setError(message.data.message || 'An error occurred');
                break;
            }
          } catch (e) {
            console.error('Error parsing message:', e);
            setError('Error processing server message');
          }
        };
  
        wsRef.current = ws;
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        setError('Failed to create WebSocket connection');
        setConnectionStatus('disconnected');
      }
    }, [cleanupWebSocket]);
  
    // Connect WebSocket when component mounts
    useEffect(() => {
      connectWebSocket();
      return cleanupWebSocket;
    }, [connectWebSocket, cleanupWebSocket]);
  
    const handleSearch = async (query: string) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        setError('Not connected to server. Please wait or refresh the page.');
        return;
      }
  
      try {
        setIsProcessing(true);
        setActiveAgents([]);
        setAgentStatuses({});
        setError(null);
        setTheaterOptions([]);
  
        wsRef.current.send(JSON.stringify({
          action: 'start_search',
          query,
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        console.error('Error sending search:', error);
        setError('Failed to send search request');
        setIsProcessing(false);
      }
    };

  return (
    <div className={`w-full max-w-4xl px-6 transition-all duration-500 ease-in-out ${
      isProcessing ? 'pt-12' : 'pt-32'
    }`}>
      <Logo />
      <SearchBar onSearch={handleSearch} isProcessing={isProcessing} />
      
      <AnimatePresence>
        {activeAgents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-8 space-y-4"
          >
            {/* Intent Card - Full Width */}
            {activeAgents.includes('intent') && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <AgentCard
                  title={agents.intent.title}
                  description={agents.intent.description}
                  icon={agents.intent.icon}
                  status={agentStatuses.intent?.status || 'processing'}
                  message={agentStatuses.intent?.message}
                  type="intent"
                />
              </motion.div>
            )}

            {/* Availability and Theaters - Side by Side */}
            {(activeAgents.includes('availability') || activeAgents.includes('theaters')) && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {activeAgents.includes('availability') && (
                  <AgentCard
                    title={agents.availability.title}
                    description={agents.availability.description}
                    icon={agents.availability.icon}
                    status={agentStatuses.availability?.status || 'processing'}
                    message={agentStatuses.availability?.message}
                    type="availability"
                  />
                )}
                {activeAgents.includes('theaters') && (
                  <AgentCard
                    title={agents.theaters.title}
                    description={agents.theaters.description}
                    icon={agents.theaters.icon}
                    status={agentStatuses.theaters?.status || 'processing'}
                    message={agentStatuses.theaters?.message}
                    type="theaters"
                  />
                )}
              </motion.div>
            )}

            {/* Directions Card - Full Width */}
            {activeAgents.includes('directions') && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <AgentCard
                  title={agents.directions.title}
                  description={agents.directions.description}
                  icon={agents.directions.icon}
                  status={agentStatuses.directions?.status || 'processing'}
                  message={agentStatuses.directions?.message}
                  type="directions"
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mt-4"
        >
          <div className="p-4 bg-danger/10 border border-danger rounded-lg">
            <p className="text-danger">{error}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SearchContainer;