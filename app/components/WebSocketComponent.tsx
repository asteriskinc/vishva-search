// app/components/WebSocketComponent.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const WebSocketComponent = () => {
    const [messages, setMessages] = useState<string[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
    const mountedRef = useRef(false);

    const connectWebSocket = useCallback(() => {
        // Check if already connected or component is unmounted
        if (wsRef.current?.readyState === WebSocket.OPEN || !mountedRef.current) {
            return;
        }

        // Clear any existing connection
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        console.log('Attempting to connect to WebSocket...');
        const ws = new WebSocket('ws://localhost:8000/ws');

        ws.onopen = () => {
            if (mountedRef.current) {
                console.log('Connected to WebSocket');
                setConnectionStatus('connected');
            }
        };

        ws.onmessage = (event) => {
            if (mountedRef.current) {
                console.log('Received message:', event.data);
                setMessages(prev => [...prev, event.data]);
            }
        };

        ws.onclose = (event) => {
            if (!mountedRef.current) return;

            console.log('WebSocket closed:', event.code, event.reason);
            setConnectionStatus('disconnected');
            wsRef.current = null;

            // Only attempt to reconnect if the component is still mounted
            if (mountedRef.current) {
                reconnectTimeoutRef.current = setTimeout(() => {
                    if (mountedRef.current) {
                        console.log('Attempting to reconnect...');
                        connectWebSocket();
                    }
                }, 3000);
            }
        };

        ws.onerror = (error) => {
            if (mountedRef.current) {
                console.error('WebSocket error:', error);
            }
        };

        wsRef.current = ws;
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        connectWebSocket();

        return () => {
            mountedRef.current = false;
            console.log('Cleaning up WebSocket connection...');
            
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            
            if (wsRef.current) {
                wsRef.current.onclose = null; // Remove onclose handler
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [connectWebSocket]);

    const sendMessage = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN && inputMessage.trim()) {
            console.log('Sending message:', inputMessage);
            wsRef.current.send(inputMessage);
            setInputMessage('');
        } else {
            console.log('Cannot send message - WebSocket is not open');
        }
    }, [inputMessage]);

    return (
        <div className="p-4">
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${
                        connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm">
                        Status: {connectionStatus}
                    </span>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        className="border p-2 rounded flex-1"
                        placeholder="Type a message..."
                    />
                    <button 
                        onClick={sendMessage}
                        disabled={connectionStatus !== 'connected'}
                        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
                    >
                        Send
                    </button>
                </div>
            </div>
            <div className="border rounded p-4 h-64 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className="mb-2">
                        {msg}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WebSocketComponent;