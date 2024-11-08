// app/ws-test2/page.tsx
import VideoProcessor from '../components/VideoProcessor'

export default function WebSocketTestPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">WebSocket Test</h1>
      <VideoProcessor />
    </div>
  )
}