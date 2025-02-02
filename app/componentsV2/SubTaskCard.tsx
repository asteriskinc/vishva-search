import React, { useState } from 'react';
import { Button } from "@nextui-org/react";
import { Settings2, X, Bot, Terminal, ChevronDown, ChevronUp } from "lucide-react";
import { TaskStatus, SubTask, SubtaskActivity } from '@/types/types';
import ActivityLog from './ActivityLog';
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
  activities?: SubtaskActivity[];
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
  latestActivity,
  activities = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
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

  const handleActivityClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const renderCardContent = () => (
    <div className="flex gap-3 p-3">
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

        {/* Activity Section */}
        {(isInProgress || isCompleted || isFailed) && latestActivity && (
          <div 
            className={`${styles.agentActivity} cursor-pointer hover:bg-white/5 rounded-lg transition-colors`}
            onClick={handleActivityClick}
          >
            <Terminal className="w-4 h-4 mt-0.5 text-white/60" />
            <div className="flex-1">
              <div className={styles.agentActivityMessage}>
                {latestActivity}
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-white/40" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white/40" />
            )}
          </div>
        )}

        {/* Expanded Activity Log */}
        {isExpanded && activities && activities.length > 0 && (
          <div className="mt-3 animate-in slide-in-from-top-2 duration-200">
            <ActivityLog 
              activities={activities}
            />
          </div>
        )}

        {subtask.userContext && (
          <div className={styles.userContext}>
            Added context: {subtask.userContext}
          </div>
        )}
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