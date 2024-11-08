// app/utils/websocket.ts

export const getWebSocketUrl = (): string => {
    if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'development') {
        return 'ws://localhost:8000/ws';
    }
    return 'wss://starfish-app-rhxek.ondigitalocean.app/ws';
};

// Optional: Add type safety for WebSocket status
export type WebSocketStatus = 'connected' | 'disconnected' | 'connecting';