// app/ws-test/page.tsx
import WebSocketComponent from '../components/WebSocketComponent'

export default function WebSocketTestPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">WebSocket Test</h1>
      <WebSocketComponent />
    </div>
  )
}