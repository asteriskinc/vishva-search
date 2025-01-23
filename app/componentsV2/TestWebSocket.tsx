// components/TestWebSocket.tsx
import { useBasicWebSocket } from '@/hooks/useBasicWebSocket';
import { Button } from '@nextui-org/react';

export const TestWebSocket = () => {
  const { sendMessage, message, isConnected } = useBasicWebSocket('test-123');

  return (
    <div className="p-4">
      <div className="flex items-center gap-4">
        <Button
          onClick={sendMessage}
          isDisabled={!isConnected}
          className="backdrop-blur-xl bg-indigo-500/20 border border-indigo-500/30 
                    text-indigo-300 hover:bg-indigo-500/30 disabled:opacity-50 
                    disabled:cursor-not-allowed disabled:hover:bg-indigo-500/20"
        >
          Send Test Message
        </Button>
        <span className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-success' : 'bg-danger'}`}></span>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      {message && (
        <pre className="mt-4 p-4 bg-black rounded-lg">
          {JSON.stringify(message, null, 2)}
        </pre>
      )}
    </div>
  );
}