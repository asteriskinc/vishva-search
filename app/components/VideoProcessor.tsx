'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getWebSocketUrl, WebSocketStatus } from '../../utils/websocket';

interface ProcessingStatus {
    step: string;
    message: string;
    progress: number;
}

interface CompletionStats {
    frames_processed: number;
    filters_applied: number;
    duration_seconds: number;
}

interface WebSocketMessage {
    type: 'status' | 'complete' | 'error';
    data: any;
    timestamp: string;
}

const VideoProcessor = () => {
    const [status, setStatus] = useState<ProcessingStatus | null>(null);
    const [completionStats, setCompletionStats] = useState<CompletionStats | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<WebSocketStatus>('disconnected');
    const [processingStarted, setProcessingStarted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
    const reconnectAttemptsRef = useRef(0);
    const mountedRef = useRef(false);
    const MAX_RECONNECT_ATTEMPTS = 5;

    const connectWebSocket = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN || !mountedRef.current) {
            return;
        }

        if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
            setError('Maximum reconnection attempts reached. Please refresh the page.');
            return;
        }

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
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
            }
        };

        ws.onmessage = (event) => {
            if (mountedRef.current) {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);
                    console.log('Received message:', message);
                    
                    switch (message.type) {
                        case 'status':
                            setStatus(message.data);
                            setError(null);
                            break;
                        case 'complete':
                            setStatus(null);
                            setCompletionStats(message.data.stats);
                            setProcessingStarted(false);
                            setError(null);
                            break;
                        case 'error':
                            console.error('Server error:', message.data.message);
                            setError(message.data.message);
                            setProcessingStarted(false);
                            break;
                    }
                } catch (e) {
                    console.error('Error parsing message:', e);
                    setError('Error processing server message');
                }
            }
        };

        ws.onclose = (event) => {
            if (!mountedRef.current) return;

            console.log('WebSocket closed with code:', event.code);
            setConnectionStatus('disconnected');
            wsRef.current = null;

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
                wsRef.current.onclose = null;
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [connectWebSocket]);

    const startProcessing = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ 
                action: 'start_processing',
                timestamp: new Date().toISOString()
            }));
            setProcessingStarted(true);
            setCompletionStats(null);
            setError(null);
        } else {
            setError('WebSocket is not connected');
        }
    }, []);

    const getStepColor = (currentStep: string) => {
        const steps = ['loading', 'analyzing', 'filtering', 'exporting'];
        const currentIndex = steps.indexOf(currentStep);
        return (step: string) => 
            steps.indexOf(step) < currentIndex ? 'bg-green-500' :
            steps.indexOf(step) === currentIndex ? 'bg-blue-500' :
            'bg-gray-200';
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className={`w-3 h-3 rounded-full ${
                        connectionStatus === 'connected' ? 'bg-green-500' : 
                        connectionStatus === 'connecting' ? 'bg-yellow-500' : 
                        'bg-red-500'
                    }`} />
                    <span className="text-sm">Status: {connectionStatus}</span>
                </div>
                
                <button 
                    onClick={startProcessing}
                    disabled={connectionStatus !== 'connected' || processingStarted}
                    className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300 hover:bg-blue-600 transition-colors"
                >
                    {processingStarted ? 'Processing...' : 'Start Video Processing'}
                </button>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded p-4">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {status && (
                <div className="mb-6">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">{status.message}</span>
                        <span className="text-sm">{Math.round(status.progress)}%</span>
                    </div>
                    
                    <div className="h-2 bg-gray-200 rounded-full mb-4">
                        <div 
                            className="h-2 bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${status.progress}%` }}
                        />
                    </div>

                    <div className="flex justify-between gap-2">
                        {['loading', 'analyzing', 'filtering', 'exporting'].map((step) => (
                            <div 
                                key={step}
                                className={`flex-1 h-1 rounded ${getStepColor(status.step)(step)} transition-colors duration-300`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {completionStats && (
                <div className="bg-green-50 border border-green-200 rounded p-4">
                    <h3 className="text-green-800 font-medium mb-2">Processing Complete!</h3>
                    <div className="text-sm text-green-700">
                        <p>Frames Processed: {completionStats.frames_processed.toLocaleString()}</p>
                        <p>Filters Applied: {completionStats.filters_applied}</p>
                        <p>Duration: {completionStats.duration_seconds} seconds</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoProcessor;