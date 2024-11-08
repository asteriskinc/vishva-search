// app/utils/websocket.ts

export const getWebSocketUrl = (): string => {
    // Local development
    if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'development') {
        return 'ws://localhost:8000/ws';
    }
    
    // Using local backend with deployed frontend
    if (process.env.NEXT_PUBLIC_USE_LOCAL_BACKEND === 'true') {
        // Provide fallback if environment variable is missing
        return process.env.NEXT_PUBLIC_LOCAL_BACKEND_URL || 'ws://localhost:8000/ws';
    }
    
    // Production environment
    if (process.env.NEXT_PUBLIC_WS_URL) {
        return process.env.NEXT_PUBLIC_WS_URL;
    }

    // Default fallback
    return 'ws://localhost:8000/ws';
};

// Optional: Add type safety for WebSocket status
export type WebSocketStatus = 'connected' | 'disconnected' | 'connecting';