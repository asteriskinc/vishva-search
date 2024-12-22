import { useState } from 'react';
import { Button, Input, Checkbox } from "@nextui-org/react";
import { MapPin, Building2, Timer, Navigation, ShoppingCart, Briefcase, CreditCard, 
  Car, Search, Settings2, Plus, Clock, Bot, ChevronDown, ChevronRight, Ticket, 
  AlertCircle, CheckCircle2 } from "lucide-react";

interface Subtask {
  title: string;
  status: 'pending' | 'active' | 'complete';
  agent: string;
  detail: string;
  icon?: any;
  category: 1 | 2;  // 1: Direct, 2: Optional
  approved?: boolean;
  userContext?: string;
}

interface Task {
  id: string;
  query: string;
  timestamp: string;
  domain: string;
  needsClarification: boolean;
  clarificationPrompt?: string;
  clarificationResponse?: string;
  subtasks: Subtask[];
}

const TaskList = () => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set(["1"]));
  const [editingSubtask, setEditingSubtask] = useState<{ taskId: string, subtaskIndex: number } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      query: "Find IMAX tickets for Dune Part Two tonight, preferably after 7 PM",
      timestamp: "Just now",
      domain: "Entertainment",
      needsClarification: true,
      clarificationPrompt: "Do you have any seating preferences (front/middle/back)?",
      subtasks: [
        {
          title: "Location Detection",
          status: "complete",
          agent: "Location Agent",
          detail: "Identified current location and nearest IMAX theaters",
          icon: MapPin,
          category: 1
        },
        {
          title: "Theater Research",
          status: "complete",
          agent: "Search Agent",
          detail: "Found 3 IMAX theaters within 15 miles showing Dune Part Two",
          icon: Building2,
          category: 1
        },
        {
          title: "Showtime Analysis",
          status: "active",
          agent: "Scheduling Agent",
          detail: "Comparing available slots after 7 PM across theaters",
          icon: Timer,
          category: 1
        },
        {
          title: "Parking Information",
          status: "pending",
          agent: "Navigation Agent",
          detail: "Would you like me to check parking availability and rates at the selected theater?",
          icon: Car,
          category: 2,
          approved: false
        },
        {
          title: "Dinner Recommendations",
          status: "pending",
          agent: "Concierge Agent",
          detail: "Should I find nearby restaurants for pre/post movie dining?",
          icon: ShoppingCart,
          category: 2,
          approved: false
        }
      ]
    }
  ]);

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
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, clarificationResponse: response, needsClarification: false }
        : task
    ));
  };

  const toggleSubtaskApproval = (taskId: string, subtaskIndex: number) => {
    setTasks(tasks.map(task => 
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
    ));
  };

  const startEditingSubtask = (taskId: string, subtaskIndex: number) => {
    setEditingSubtask({ taskId, subtaskIndex });
  };

  const handleSubtaskContextSubmit = (taskId: string, subtaskIndex: number, context: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? {
            ...task,
            subtasks: task.subtasks.map((subtask, idx) => 
              idx === subtaskIndex 
                ? { 
                    ...subtask, 
                    userContext: context,
                    status: 'pending' // Reset status to trigger re-execution
                  }
                : subtask
            )
          }
        : task
    ));
    setEditingSubtask(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      {tasks.map(task => (
        <div key={task.id} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl overflow-hidden">
          {/* Task Header */}
          <div className="p-4 flex items-start gap-3 cursor-pointer hover:bg-white/5">
            <div className="mt-1 text-white/60" onClick={() => toggleTask(task.id)}>
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
              {task.needsClarification && (
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

              {/* Subtasks */}
              <div className="px-11 py-4 space-y-3">
                {task.subtasks.map((subtask, idx) => (
                  <div key={idx}>
                    <div className={`backdrop-blur-xl rounded-lg transition-colors ${
                      subtask.category === 2 
                        ? 'bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20' 
                        : 'bg-white/5 hover:bg-white/10 border border-blue-500/20'
                    }`}>
                      <div className="flex gap-3 p-3">
                        {subtask.category === 2 && (
                          <div className="flex items-start pt-1">
                            <Checkbox
                              isSelected={subtask.approved}
                              onValueChange={() => toggleSubtaskApproval(task.id, idx)}
                              classNames={{
                                wrapper: "before:border-amber-500/40",
                                label: "text-white/90"
                              }}
                            />
                          </div>
                        )}
                        <div className="mt-1">
                          {subtask.icon && (
                            <subtask.icon className={`w-5 h-5 ${
                              subtask.category === 2 ? 'text-amber-400' : 'text-blue-400'
                            }`} />
                          )}
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
                              onClick={() => startEditingSubtask(task.id, idx)}
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
                    
                    {/* Edit Context Input */}
                    {editingSubtask?.taskId === task.id && editingSubtask?.subtaskIndex === idx && (
                      <div className="mt-2">
                        <Input
                          placeholder="Add context or clarification..."
                          classNames={{
                            input: "bg-transparent text-white/90",
                            inputWrapper: "backdrop-blur-xl bg-purple-400/10 border-purple-400/20"
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSubtaskContextSubmit(task.id, idx, e.currentTarget.value);
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TaskList;