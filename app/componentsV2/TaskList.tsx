"use client"
import { useState, useEffect } from 'react';
import { Button, Input, Checkbox } from "@nextui-org/react";
import { MapPin, Building2, Timer, Navigation, ShoppingCart, Briefcase, CreditCard, 
  Car, Search, Settings2, Plus, Clock, Bot, ChevronDown, ChevronRight, AlertCircle } from "lucide-react";
import { TaskResponse, SubTask } from '@/app/api/process-query/route';

const ICON_MAP: { [key: string]: any } = {
  MapPin,
  Building2,
  Timer,
  Navigation,
  ShoppingCart,
  Briefcase,
  CreditCard,
  Car,
  Search,
  Bot
};

interface TaskListProps {
  tasks?: TaskResponse[];
  onTaskUpdate?: (updatedTask: TaskResponse) => void;
}

const TaskList = ({ tasks = [], onTaskUpdate }: TaskListProps) => {
  // Add useEffect import at the top if not already present
  useEffect(() => {
    if (tasks.length > 0) {
      setExpandedTasks(prev => new Set([tasks[0].id, ...prev]));
    }
  }, [tasks.length]);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(() => {
    // Initialize with the most recent task ID if tasks exist
    return new Set(tasks.length > 0 ? [tasks[0].id] : []);
  });
  const [editingSubtask, setEditingSubtask] = useState<{ taskId: string, subtaskIndex: number } | null>(null);

  const toggleTask = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const handleClarificationSubmit = (taskId: string, response: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, needsClarification: false, clarificationResponse: response }
        : task
    );
    onTaskUpdate?.(updatedTasks.find(t => t.id === taskId)!);
  };

  const toggleSubtaskApproval = (taskId: string, subtaskIndex: number) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? {
            ...task,
            subtasks: task.subtasks.map((subtask, idx) => 
              idx === subtaskIndex 
                ? { ...subtask, approved: !subtask.approved }
                : subtask
            )
          }
        : task
    );
    onTaskUpdate?.(updatedTasks.find(t => t.id === taskId)!);
  };

  const handleSubtaskContextSubmit = (taskId: string, subtaskIndex: number, context: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? {
            ...task,
            subtasks: task.subtasks.map((subtask, idx) => 
              idx === subtaskIndex 
                ? { 
                    ...subtask, 
                    userContext: context,
                    status: 'pending'
                  }
                : subtask
            )
          }
        : task
    );
    onTaskUpdate?.(updatedTasks.find(t => t.id === taskId)!);
    setEditingSubtask(null);
  };

  const renderSubtask = (subtask: SubTask, taskId: string, index: number) => {
    const IconComponent = subtask.icon ? ICON_MAP[subtask.icon] : ICON_MAP.Bot;

    return (
      <div key={index}>
        <div className={`backdrop-blur-xl rounded-lg transition-colors ${
          subtask.category === 2 
            ? 'bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20' 
            : 'bg-white/5 hover:bg-white/10 border border-blue-500/20'
        }`}>
          <div className="flex gap-3 p-3">
            {subtask.category === 2 && (
              <div className="flex items-start pt-1">
                <Checkbox
                  isSelected={subtask.approved || false}
                  onValueChange={() => toggleSubtaskApproval(taskId, index)}
                  classNames={{
                    wrapper: "before:border-amber-500/40",
                    label: "text-white/90"
                  }}
                />
              </div>
            )}
            <div className="mt-1">
              <IconComponent className={`w-5 h-5 ${
                subtask.category === 2 ? 'text-amber-400' : 'text-blue-400'
              }`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-white/90">{subtask.title}</span>
                  {subtask.category === 1 && (
                    <div className={`w-2 h-2 rounded-full ${
                      subtask.status === 'complete' ? 'bg-green-400' :
                      subtask.status === 'active' ? 'bg-blue-400' :
                      'bg-white/30'
                    }`} />
                  )}
                </div>
                <Button
                  size="sm"
                  className="backdrop-blur-xl bg-white/5 border border-white/20 text-white/60 w-8 h-8 min-w-0 p-0"
                  onClick={() => setEditingSubtask({ taskId, subtaskIndex: index })}
                >
                  <Settings2 className="w-4 h-4" />
                </Button>
              </div>
              <div className={`text-sm mt-1 ${
                subtask.category === 2 ? 'text-amber-100/80' : 'text-white/60'
              }`}>
                {subtask.detail}
              </div>
              {subtask.userContext && (
                <div className="mt-2 text-sm text-purple-300 bg-purple-500/10 px-3 py-2 rounded-lg">
                  Added context: {subtask.userContext}
                </div>
              )}
              <div className="flex items-center gap-1 mt-1 text-xs text-white/50">
                <Bot className="w-3 h-3" />
                {subtask.agent}
              </div>
            </div>
          </div>
        </div>
        
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

  const renderSubtasks = (task: TaskResponse) => {
    const directTasks = task.subtasks.filter(st => st.category === 1);
    const optionalTasks = task.subtasks.filter(st => st.category === 2);

    return (
      <div className="px-11 py-4 space-y-3">
        {/* Direct Tasks */}
        {directTasks.map((subtask, idx) => renderSubtask(subtask, task.id, task.subtasks.indexOf(subtask)))}
        
        {/* Optional Tasks Section */}
        {optionalTasks.length > 0 && (
          <>
            <div className="flex items-center gap-4 my-6">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="text-white/40 text-sm">Optional Tasks</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>
            {optionalTasks.map((subtask, idx) => renderSubtask(subtask, task.id, task.subtasks.indexOf(subtask)))}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      {tasks.map(task => (
        <div key={task.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl overflow-hidden">
          {/* Task Header */}
          <div 
            className="p-4 flex items-start gap-3 cursor-pointer hover:bg-white/5"
            onClick={() => toggleTask(task.id)}
          >
            <div className="mt-1 text-white/60">
              {expandedTasks.has(task.id) ? 
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
                  {task.subtasks.length} agents
                </span>
              </div>
            </div>
          </div>

          {/* Expanded Content */}
          {expandedTasks.has(task.id) && (
            <div className="backdrop-blur-xl bg-black/40">
              {/* Clarification Section */}
              {task.needsClarification && task.clarificationPrompt && (
                <div className="px-11 py-4 border-b border-white/10 bg-purple-500/10">
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
                            handleClarificationSubmit(task.id, e.currentTarget.value);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Subtasks with separation */}
              {renderSubtasks(task)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TaskList;