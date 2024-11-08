// app/api/ws/route.ts
import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: Request) {
  const upgradeHeader = request.headers.get('upgrade')
  
  if (!upgradeHeader || upgradeHeader !== 'websocket') {
    return new NextResponse('Expected Upgrade: websocket', { status: 426 })
  }

  try {
    // @ts-ignore
    const { socket, response } = Deno.upgradeWebSocket(request)

    socket.onopen = () => {
      console.log('Client connected')
    }

    socket.onmessage = (event: MessageEvent) => {
      console.log('Received:', event.data)
      socket.send(`Echo: ${event.data}`)
    }

    return response
  } catch (err) {
    console.error('WebSocket upgrade failed:', err)
    return new NextResponse('WebSocket upgrade failed', { status: 500 })
  }
}