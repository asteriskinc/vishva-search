import React from 'react';
import { Button } from "@nextui-org/react";
import { Settings2, X, Bot, Terminal } from "lucide-react";
import { TaskStatus, SubTask } from '@/types/types';
import styles from './SubTaskCard.module.css';

interface SubTaskCardProps {
  subtask: SubTask;
  taskId: string;
  index: number;
  status: TaskStatus;
  IconComponent: React.ElementType;
  onPromote?: (taskId: string, index: number) => void;
  onRemove?: (taskId: string, index: number) => void;
  onEditContext?: (taskId: string, index: number) => void;
  latestActivity?: string;
}

const SubTaskCard: React.FC<SubTaskCardProps> = ({
  subtask,
  taskId,
  index,
  status,
  IconComponent,
  onPromote,
  onRemove,
  onEditContext,
  latestActivity
}) => {
  const isOptional = subtask.category === 2;
  const isInProgress = status === TaskStatus.IN_PROGRESS;
  const isCompleted = status === TaskStatus.COMPLETED;
  const isFailed = status === TaskStatus.FAILED;
  const isPending = status === TaskStatus.PENDING;
  
  const getStatusDotClass = () => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return styles.statusCompleted;
      case TaskStatus.IN_PROGRESS:
        return styles.statusInProgress;
      case TaskStatus.FAILED:
        return styles.statusFailed;
      default:
        return styles.statusPending;
    }
  };

  const renderCardContent = () => (
    <div className="flex gap-3 p-3 pb-5">
      <div className="mt-1">
        <IconComponent 
          className={isOptional ? 'text-amber-400' : 'text-blue-400'} 
          style={{ width: '20px', height: '20px' }} 
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white/90">{subtask.title}</span>
            <div className={`${styles.statusDot} ${getStatusDotClass()}`} />
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

        {/* Subtask Detail Section - Auto-displayed for pending tasks */}
        {isPending && subtask.detail && (
          <div className="mt-2 text-sm text-white/70">
            {subtask.detail}
          </div>
        )}

        {/* Agent Activity Section */}
        {(isInProgress || isCompleted || isFailed) && latestActivity && (
          <div className={styles.agentActivity}>
            <Terminal className="w-4 h-4 mt-0.5 text-white/60" />
            <div className={styles.agentActivityMessage}>
              {latestActivity}
            </div>
          </div>
        )}

        {subtask.userContext && (
          <div className={styles.userContext}>
            Added context: {subtask.userContext}
          </div>
        )}
        
        {/* <div className={styles.agentInfo}>
          <Bot style={{ width: '12px', height: '12px' }} />
          {subtask.agent.name}
        </div> */}
      </div>
    </div>
  );

  if (isInProgress) {
    return (
      <div className={styles.animatedBorder}>
        <div className={styles.content}>
          {renderCardContent()}
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className={styles.completedBorder}>
        <div className={styles.content}>
          {renderCardContent()}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${styles.regularCard} ${isOptional ? styles.optional : ''}`}
      onClick={() => isOptional && onPromote?.(taskId, index)}
    >
      {renderCardContent()}
    </div>
  );
};

export default SubTaskCard;