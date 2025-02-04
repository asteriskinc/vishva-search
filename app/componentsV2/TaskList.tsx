// app/componentsV2/TaskList.tsx
import React, { useState, useEffect } from 'react';
import { Button, Input, Skeleton } from "@nextui-org/react";
import { MapPin, Building2, Timer, Navigation, ShoppingCart, Briefcase, CreditCard, 
  Car, Search, Settings2, Plus, Clock, Bot, ChevronDown, ChevronRight, AlertCircle, X } from "lucide-react";
import { Task, SubTask, TaskListProps, IconMap, EditingSubtask, TaskStatus, SubtaskActivity } from '@/types/types';
import { useTaskWebSocket } from "@/hooks/useTaskWebSocket";
import { useWebSocket } from '@/contexts/WebSocketContext';
// import TaskExecutionMonitor from './TaskExecutionMonitor';
import SubtaskCard from './SubTaskCard';

const ICON_MAP: IconMap = {
  MapPin, Building2, Timer, Navigation, ShoppingCart, 
  Briefcase, CreditCard, Car, Search, Bot
};

const TaskList: React.FC<TaskListProps> = ({
  tasks = [],
  onTaskUpdate,
  isLoading = false
}) => {
  // State declarations
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(() => {
    return new Set(tasks.length > 0 ? [tasks[0].task_id] : []);
  });
  const [editingSubtask, setEditingSubtask] = useState<EditingSubtask | null>(null);
  const [subtaskActivities, setSubtaskActivities] = useState<Record<string, SubtaskActivity[]>>({});
  


  // Create WebSocket hooks for each task
  const taskWebSockets = tasks.reduce((acc, task) => {
    acc[task.task_id] = useTaskWebSocket(task);
    return acc;
  }, {} as Record<string, ReturnType<typeof useTaskWebSocket>>);

  const { subscribe } = useWebSocket();

  useEffect(() => {
    if (tasks.length > 0 && !isLoading) {
      setExpandedTasks(prev => new Set([tasks[0].task_id, ...Array.from(prev)]));
    }

    const unsubscribes = tasks.map(task => {
      return subscribe(task.task_id, (message: any) => {
        if (message.type === 'SUBTASK_UPDATE' && message.payload.subtask_id) {
          const activity = {
            subtaskId: message.payload.subtask_id,
            taskId: task.task_id,
            message: message.payload.message,
            timestamp: message.payload.timestamp,
            content: message.payload.content
          };

          setSubtaskActivities(prev => {
            const subtaskId = message.payload.subtask_id;
            const currentActivities = prev[subtaskId] || [];
            return {
              ...prev,
              [subtaskId]: [...currentActivities, activity]
            };
          });
        }
      });
    });
  
    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [tasks.length, isLoading, subscribe]);

  // Function to filter subtasks based on execution status
  const getFilteredSubtasks = (task: Task) => {
    const { executionStatus } = taskWebSockets[task.task_id];
    
    if (executionStatus === TaskStatus.COMPLETED || executionStatus === TaskStatus.FAILED) {
      return task.subtasks.filter(subtask => 
        subtask.category === 1 || 
        (subtask.category === 2 && subtask.status !== TaskStatus.PENDING)
      );
    }
    return task.subtasks;
  };

  const toggleTask = (taskId: string) => {
    setExpandedTasks(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(taskId)) {
        newExpanded.delete(taskId);
      } else {
        newExpanded.add(taskId);
      }
      return newExpanded;
    });
  };

  const handleClarificationSubmit = (taskId: string, response: string) => {
    const updatedTasks = tasks.map(task => 
      task.task_id === taskId 
        ? { ...task, needsClarification: false, clarificationResponse: response }
        : task
    );
    onTaskUpdate?.(updatedTasks.find(t => t.task_id === taskId)! as Task);
  };

  const promoteToDirectTask = (taskId: string, subtaskIndex: number) => {
    const updatedTasks = tasks.map(task => 
      task.task_id === taskId 
        ? {
            ...task,
            subtasks: task.subtasks.map((subtask, idx) => 
              idx === subtaskIndex ? { ...subtask, category: 1 } : subtask
            )
          }
        : task
    );
    onTaskUpdate?.(updatedTasks.find(t => t.task_id === taskId)! as Task);
  };

  const removeOptionalTask = (taskId: string, subtaskIndex: number) => {
    const updatedTasks = tasks.map(task => 
      task.task_id === taskId 
        ? {
            ...task,
            subtasks: task.subtasks.filter((_, idx) => idx !== subtaskIndex)
          }
        : task
    );
    onTaskUpdate?.(updatedTasks.find(t => t.task_id === taskId)! as Task);
  };

  const handleSubtaskContextSubmit = (taskId: string, subtaskIndex: number, context: string) => {
    const updatedTasks = tasks.map(task => 
      task.task_id === taskId 
        ? {
            ...task,
            subtasks: task.subtasks.map((subtask, idx) => 
              idx === subtaskIndex 
                ? { ...subtask, userContext: context, status: TaskStatus.PENDING }
                : subtask
            )
          }
        : task
    );
    onTaskUpdate?.(updatedTasks.find(t => t.task_id === taskId)! as Task);
    setEditingSubtask(null);
  };

  const renderSubtask = (subtask: SubTask, taskId: string, index: number) => {
    const IconComponent = subtask.icon ? ICON_MAP[subtask.icon] : ICON_MAP.Bot;
    const { getSubtaskStatus } = taskWebSockets[taskId];
    const status = getSubtaskStatus(subtask.subtask_id);
    const activities = subtaskActivities[subtask.subtask_id] || [];
    const latestActivity = activities[activities.length - 1]?.message;
  
  
    return (
      <div key={subtask.subtask_id}>
        <SubtaskCard
          subtask={subtask}
          taskId={taskId}
          index={index}
          status={status}
          IconComponent={IconComponent}
          onPromote={promoteToDirectTask}
          onRemove={removeOptionalTask}
          onEditContext={(taskId, index) => setEditingSubtask({ taskId, subtaskIndex: index })}
          latestActivity={latestActivity}
          activities={activities}
        />
        
        {editingSubtask?.taskId === taskId && editingSubtask?.subtaskIndex === index && (
          <div className="mt-2">
            <Input
              placeholder="Add context or clarification..."
              classNames={{
                input: "bg-transparent text-white/90",
                inputWrapper: "backdrop-blur-xl bg-purple-400/10 border-purple-400/20"
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubtaskContextSubmit(taskId, index, e.currentTarget.value);
                }
              }}
            />
          </div>
        )}
      </div>
    );
  };

  const renderSubtasks = (task: Task) => {
    const { 
      isConnected, 
      error, 
      executeTask,
      isExecuting 
    } = taskWebSockets[task.task_id];

    // Filter subtasks based on execution status
    const filteredSubtasks = getFilteredSubtasks(task);
    const directTasks = filteredSubtasks.filter(st => st.category === 1);
    const optionalTasks = filteredSubtasks.filter(st => st.category === 2);

    return (
      <div className="px-4 py-4 space-y-3">
        {/* Execute Button Section */}
        <div className="flex items-center justify-end gap-3 mb-4">
          {/* Connection Status Dot */}
          <div 
            className={`w-3 h-3 rounded-full transition-colors ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}
            title={isConnected ? 'Connected' : error || 'Disconnected'}
          />
          
          {/* Execute Button */}
          <Button
            className="backdrop-blur-xl bg-indigo-500/20 border border-indigo-500/30 
                     text-indigo-300 hover:bg-indigo-500/30 disabled:opacity-50 
                     disabled:cursor-not-allowed disabled:hover:bg-indigo-500/20"
            onClick={executeTask}
            isLoading={isExecuting}
            isDisabled={!isConnected}
          >
            Execute Task
          </Button>
        </div>

        {/* Execution Monitor */}
        {/* {isExecuting && (
          <TaskExecutionMonitor 
            taskId={task.task_id}
            isConnected={isConnected}
            error={error}
          />
        )} */}

        {/* Direct Tasks */}
        {directTasks.map((subtask, idx) => 
          renderSubtask(subtask, task.task_id, task.subtasks.indexOf(subtask))
        )}
        
        {/* Optional Tasks Section */}
        {optionalTasks.length > 0 && (
          <>
            <div className="flex items-center gap-4 my-6">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="text-white/40 text-sm">
                {isExecuting 
                  ? "Additional Tasks" 
                  : "Click to Add These Suggested Tasks"
                }
              </span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>
            {optionalTasks.map((subtask, idx) => 
              renderSubtask(subtask, task.task_id, task.subtasks.indexOf(subtask))
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3">
      {tasks.map(task => (
        <div key={task.task_id} className="backdrop-blur-xl bg-white/10 rounded-xl shadow-[0_20px_30px_-2px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Task Header */}
          <div 
            className="p-4 flex items-start gap-3 cursor-pointer hover:bg-white/5"
            onClick={() => toggleTask(task.task_id)}
          >
            <div className="mt-1 text-white/60">
              {expandedTasks.has(task.task_id) ? 
                <ChevronDown className="w-4 h-4" /> : 
                <ChevronRight className="w-4 h-4" />
              }
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div className="text-white/90 font-medium">{task.query}</div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="backdrop-blur-xl bg-white/5 border border-white/20 text-white/60 w-10 h-10 min-w-0"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <span className="backdrop-blur-xl bg-white/5 border border-white/20 text-white/60 px-2 py-1 rounded-lg text-xs">
                    {task.domain}
                  </span>
                </div>
              </div>
              <div className="flex gap-3 mt-2 text-sm text-white/60">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {task.timestamp}
                </span>
                <span className="flex items-center gap-1">
                  <Bot className="w-3 h-3" />
                  {getFilteredSubtasks(task).length} agents
                </span>
              </div>
            </div>
          </div>

          {/* Expanded Content */}
          {expandedTasks.has(task.task_id) && (
            <div className="backdrop-blur-xl bg-black/40">
              {/* Clarification Section */}
              {task.needsClarification && task.clarificationPrompt && (
                <div className="px-6 py-3 border-b border-white/10 bg-purple-500/10">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-purple-300 mt-1" />
                    <div className="flex-1">
                      <div className="text-white/90 mb-2">{task.clarificationPrompt}</div>
                      <Input
                        placeholder="Type your response..."
                        classNames={{
                          input: "bg-transparent text-white/90",
                          inputWrapper: "backdrop-blur-xl bg-purple-400/10 border-purple-400/20"
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleClarificationSubmit(task.task_id, e.currentTarget.value);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Always render the content div, but show skeletons when loading */}
              <div className="px-6 py-3 space-y-4">
                {isLoading ? (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                      <Skeleton className="w-4 h-4 rounded-full bg-white/10" />
                      <Skeleton className="w-3/4 h-6 rounded-lg bg-white/10" />
                    </div>
                    
                    {/* Skeleton for Direct Tasks */}
                    {[1, 2].map((i) => (
                      <div key={`skeleton-direct-${i}`} className="backdrop-blur-xl bg-white/5 border border-blue-500/20 rounded-lg p-3">
                        <div className="flex gap-3">
                          <Skeleton className="w-5 h-5 rounded bg-white/10" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="w-1/3 h-5 rounded bg-white/10" />
                            <Skeleton className="w-2/3 h-4 rounded bg-white/10" />
                            <Skeleton className="w-1/4 h-3 rounded bg-white/10" />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Skeleton for Optional Tasks Section */}
                    <div className="flex items-center gap-4 my-6">
                      <div className="flex-grow border-t border-white/10"></div>
                      <Skeleton className="w-48 h-4 rounded bg-white/10" />
                      <div className="flex-grow border-t border-white/10"></div>
                    </div>

                    {/* Skeleton for Optional Tasks */}
                    {[1, 2].map((i) => (
                      <div key={`skeleton-optional-${i}`} className="backdrop-blur-xl bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                        <div className="flex gap-3">
                          <Skeleton className="w-5 h-5 rounded bg-white/10" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="w-1/3 h-5 rounded bg-white/10" />
                            <Skeleton className="w-2/3 h-4 rounded bg-white/10" />
                            <Skeleton className="w-1/4 h-3 rounded bg-white/10" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  /* Actual subtasks content */
                  renderSubtasks(task)
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TaskList;