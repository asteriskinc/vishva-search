import React from 'react';
import { Button } from "@nextui-org/react";
import { Settings2, X, Bot } from "lucide-react";
import { TaskStatus, SubTask } from '@/types/types';

interface SubTaskCardProps {
  subtask: SubTask;
  taskId: string;
  index: number;
  status: TaskStatus;
  IconComponent: React.ElementType;
  onPromote?: (taskId: string, index: number) => void;
  onRemove?: (taskId: string, index: number) => void;
  onEditContext?: (taskId: string, index: number) => void;
}

const SubTaskCard: React.FC<SubTaskCardProps> = ({
  subtask,
  taskId,
  index,
  status,
  IconComponent,
  onPromote,
  onRemove,
  onEditContext
}) => {
  const isOptional = subtask.category === 2;
  const isInProgress = status === TaskStatus.IN_PROGRESS;
  const isCompleted = status === TaskStatus.COMPLETED;
  
  return (
    <div className="relative">
      {/* Animated border container for in-progress */}
      {isInProgress && (
        <div className="animated-border">
          <div className="content">
            {/* Card content */}
            <div className="flex gap-3 p-3">
              {/* ... Existing content structure ... */}
              <div className="mt-1">
                <IconComponent className={isOptional ? 'text-amber-400' : 'text-blue-400'} 
                  style={{ width: '20px', height: '20px' }} />
              </div>
              <div className="flex-1">
                {/* ... Rest of the content ... */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-white/90">{subtask.title}</span>
                    <div className={`status-dot ${
                      status === TaskStatus.COMPLETED ? 'status-completed' :
                      status === TaskStatus.IN_PROGRESS ? 'status-in-progress' :
                      status === TaskStatus.FAILED ? 'status-failed' :
                      'status-pending'
                    }`} />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="backdrop-blur-xl bg-white/5 border border-white/20 text-white/60 w-8 h-8 min-w-0 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditContext?.(taskId, index);
                      }}
                    >
                      <Settings2 className="w-4 h-4" />
                    </Button>
                    {isOptional && (
                      <Button
                        isIconOnly
                        size="sm"
                        className="backdrop-blur-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 w-8 h-8 min-w-0 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove?.(taskId, index);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className={isOptional ? 'text-amber-100/80' : 'text-white/60'} 
                  style={{ fontSize: '14px', marginTop: '4px' }}>
                  {subtask.detail}
                </div>
                {subtask.userContext && (
                  <div className="user-context">
                    Added context: {subtask.userContext}
                  </div>
                )}
                <div className="agent-info">
                  <Bot style={{ width: '12px', height: '12px' }} />
                  {subtask.agent.name}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animated border container for completed */}
      {isCompleted && (
        <div className="completed-border">
          <div className="content">
            {/* Same content structure as above */}
            <div className="flex gap-3 p-3">
              <div className="mt-1">
                <IconComponent className={isOptional ? 'text-amber-400' : 'text-blue-400'} 
                  style={{ width: '20px', height: '20px' }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-white/90">{subtask.title}</span>
                    <div className="status-dot status-completed" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="backdrop-blur-xl bg-white/5 border border-white/20 text-white/60 w-8 h-8 min-w-0 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditContext?.(taskId, index);
                      }}
                    >
                      <Settings2 className="w-4 h-4" />
                    </Button>
                    {isOptional && (
                      <Button
                        isIconOnly
                        size="sm"
                        className="backdrop-blur-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 w-8 h-8 min-w-0 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove?.(taskId, index);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className={isOptional ? 'text-amber-100/80' : 'text-white/60'} 
                  style={{ fontSize: '14px', marginTop: '4px' }}>
                  {subtask.detail}
                </div>
                {subtask.userContext && (
                  <div className="user-context">
                    Added context: {subtask.userContext}
                  </div>
                )}
                <div className="agent-info">
                  <Bot style={{ width: '12px', height: '12px' }} />
                  {subtask.agent.name}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regular (non-animated) card for other states */}
      {!isInProgress && !isCompleted && (
        <div 
          className={isOptional ? 'regular-card optional' : 'regular-card'} 
          onClick={() => isOptional && onPromote?.(taskId, index)}
        >
          {/* ... Existing regular card content ... */}
          <div className="flex gap-3 p-3">
            <div className="mt-1">
              <IconComponent className={isOptional ? 'text-amber-400' : 'text-blue-400'} 
                style={{ width: '20px', height: '20px' }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-white/90">{subtask.title}</span>
                  <div className={`status-dot ${
                    status === TaskStatus.FAILED ? 'status-failed' :
                    'status-pending'
                  }`} />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="backdrop-blur-xl bg-white/5 border border-white/20 text-white/60 w-8 h-8 min-w-0 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditContext?.(taskId, index);
                    }}
                  >
                    <Settings2 className="w-4 h-4" />
                  </Button>
                  {isOptional && (
                    <Button
                      isIconOnly
                      size="sm"
                      className="backdrop-blur-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 w-8 h-8 min-w-0 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove?.(taskId, index);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className={isOptional ? 'text-amber-100/80' : 'text-white/60'} 
                style={{ fontSize: '14px', marginTop: '4px' }}>
                {subtask.detail}
              </div>
              {subtask.userContext && (
                <div className="user-context">
                  Added context: {subtask.userContext}
                </div>
              )}
              <div className="agent-info">
                <Bot style={{ width: '12px', height: '12px' }} />
                {subtask.agent.name}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @property --gradient-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }

        .animated-border, .completed-border {
          position: relative;
          border-radius: 0.5rem;
          margin: 0.5rem 0;
        }

        .animated-border::before,
        .animated-border::after {
          content: "";
          position: absolute;
          inset: -0.15rem;
          z-index: -1;
          background: conic-gradient(
            from var(--gradient-angle),
            rgb(255, 255, 255),
            rgb(168, 85, 247),
            rgb(59, 130, 246),
            rgb(236, 72, 153),
            rgb(82, 182, 255),
            rgb(255, 255, 255)
          );
          border-radius: calc(0.5rem + 0.15rem);
          animation: rotation 3s linear infinite;
        }

        .completed-border::before,
        .completed-border::after {
          content: "";
          position: absolute;
          inset: -0.15rem;
          z-index: -1;
          background: conic-gradient(
            from var(--gradient-angle),
            rgb(74, 222, 128),
            rgb(34, 197, 94),
            rgb(22, 163, 74),
            rgb(21, 128, 61),
            rgb(34, 197, 94),
            rgb(74, 222, 128)
          );
          border-radius: calc(0.5rem + 0.15rem);
          animation: rotation 3s linear infinite;
        }

        .animated-border::after {
          filter: blur(1.5rem);
        }

        .completed-border::after {
          filter: blur(1.5rem);
          opacity: 0.5;
        }

        .content {
          background: rgba(0, 0, 0, 0.8);
          border-radius: 0.5rem;
          position: relative;
          z-index: 1;
        }

        @keyframes rotation {
          0% { --gradient-angle: 0deg; }
          100% { --gradient-angle: 360deg; }
        }

        .regular-card {
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 0.5rem;
          margin: 0.5rem 0;
        }

        .regular-card.optional {
          background: rgba(251, 191, 36, 0.05);
          border: 1px solid rgba(251, 191, 36, 0.2);
          cursor: pointer;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-completed { 
          background: rgb(74, 222, 128);
          animation: completePulse 2s infinite;
        }
        .status-in-progress { 
          background: rgb(59, 130, 246);
          animation: pulse 2s infinite;
        }
        .status-failed { background: rgb(248, 113, 113); }
        .status-pending { background: rgba(255, 255, 255, 0.3); }

        .user-context {
          margin-top: 8px;
          font-size: 14px;
          color: rgb(216, 180, 254);
          background: rgba(168, 85, 247, 0.1);
          padding: 8px 12px;
          border-radius: 0.5rem;
        }

        .agent-info {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 4px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes completePulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 10px rgba(74, 222, 128, 0.5); }
          50% { opacity: 0.8; box-shadow: 0 0 20px rgba(74, 222, 128, 0.8); }
        }
      `}</style>
    </div>
  );
};

export default SubTaskCard;