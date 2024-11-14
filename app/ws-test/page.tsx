// app/ws-test/page.tsx
"use client";
import WebsocketChat from '../components/WebsocketChat'

export default function WebSocketTestPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">WebSocket Test</h1>
      <WebsocketChat />
    </div>
  )
}