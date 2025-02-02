import React from 'react';
import { Globe2, Search, MapPin, Navigation, Terminal, ArrowRight, AlertCircle } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { SubtaskActivity, WebSocketMessageContent } from '@/types/types';

interface ActivityLogProps {
  activities: SubtaskActivity[];
  className?: string;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ activities = [], className = "" }) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  const getToolIcon = (toolName: string) => {
    switch (toolName) {
      case 'web_search':
        return <Search className="w-4 h-4 text-blue-400" />;
      case 'get_distance_matrix':
        return <MapPin className="w-4 h-4 text-amber-400" />;
      case 'get_directions':
        return <Navigation className="w-4 h-4 text-green-400" />;
      default:
        return <Globe2 className="w-4 h-4 text-purple-400" />;
    }
  };

  const renderToolCallStart = (content: WebSocketMessageContent) => {
    if (content.type !== 'tool_call_start') return null;
    const { tool, arguments: args } = content.data;
    
    return (
      <div className="ml-6 mt-2 bg-white/5 rounded-lg p-3">
        <div className="text-sm text-white/60">
          <div className="font-medium text-white/80 mb-2">Arguments:</div>
          <pre className="text-xs bg-black/20 p-2 rounded overflow-x-auto max-w-[calc(100vw-16rem)]">
            {JSON.stringify(args, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  const renderToolResult = (content: WebSocketMessageContent) => {
    if (content.type !== 'tool_result') return null;
    const { tool, result, error } = content.data;

    if (error) {
      return (
        <div className="ml-6 mt-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span>Error: {error}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="ml-6 mt-2 bg-white/5 rounded-lg p-3">
        <div className="text-sm">
          <div className="font-medium text-white/80 mb-2">Result:</div>
          <div className="text-xs bg-black/20 p-2 rounded">
            <div className="overflow-x-auto">
              <pre className="whitespace-pre-wrap break-all">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAgentResponse = (content: WebSocketMessageContent) => {
    if (content.type !== 'agent_response') return null;
    const { content: responseContent } = content.data;

    return (
      <div className="ml-6 mt-2 bg-white/5 rounded-lg p-3">
        <div className="text-sm text-white/80 whitespace-pre-wrap">{responseContent}</div>
      </div>
    );
  };

  if (activities.length === 0) {
    return (
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-3">
        <div className="text-sm text-white/40 text-center">No activity recorded yet</div>
      </div>
    );
  }

  return (
    <div className={`text-sm text-white/60 ${className}`}>
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-3">
        <div className="font-medium text-white/80 mb-3">Activity Log</div>
        <ScrollArea className="h-64 pr-4 max-h-[50vh]">
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="space-y-2">
                {/* Activity Header */}
                <div className="flex items-start gap-2">
                  {activity.content?.type === 'tool_call_start' ? (
                    getToolIcon(activity.content.data.tool)
                  ) : (
                    <Terminal className="w-4 h-4 mt-1 text-white/40" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white/90 font-medium">
                        {activity.content?.type === 'tool_call_start' 
                          ? activity.content.data.tool.replace(/_/g, ' ')
                          : 'Agent'}
                      </span>
                      <span className="text-white/40 text-xs">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>
                    <div className="text-white/70 mt-1">{activity.message}</div>
                  </div>
                </div>

                {/* Activity Content */}
                {activity.content && (
                  <>
                    {activity.content.type === 'tool_call_start' && renderToolCallStart(activity.content)}
                    {activity.content.type === 'tool_result' && renderToolResult(activity.content)}
                    {activity.content.type === 'agent_response' && renderAgentResponse(activity.content)}
                  </>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ActivityLog;