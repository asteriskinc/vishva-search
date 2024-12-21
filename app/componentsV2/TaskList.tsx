"use client"
import { useState } from 'react';
import { Card, CardBody, Divider, Chip, Button } from "@nextui-org/react";
import { MapPin, Building2, Timer, Navigation, ShoppingCart, Briefcase, CreditCard, Car, Search, Edit2, Plus, Clock, Bot, ChevronDown, ChevronRight, Ticket } from "lucide-react";

interface Subtask {
  title: string;
  status: 'pending' | 'active' | 'complete';
  agent: string;
  detail: string;
  icon?: any;
}

interface Task {
  id: string;
  query: string;
  timestamp: string;
  domain: string;
  subtasks: Subtask[];
}

export const TaskList = () => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set(["1"])); // Start with first task expanded
  const [editingSubtask, setEditingSubtask] = useState<{ taskId: string, subtaskIndex: number } | null>(null);

  const tasks: Task[] = [
    {
      id: "1",
      query: "Find IMAX tickets for Dune Part Two tonight, preferably after 7 PM",
      timestamp: "Just now",
      domain: "Entertainment",
      subtasks: [
        {
          title: "Location Detection",
          status: "complete",
          agent: "Location Agent",
          detail: "Identified current location and nearest IMAX theaters",
          icon: MapPin
        },
        {
          title: "Theater Research",
          status: "complete",
          agent: "Search Agent",
          detail: "Found 3 IMAX theaters within 15 miles showing Dune Part Two",
          icon: Building2
        },
        {
          title: "Showtime Analysis",
          status: "active",
          agent: "Scheduling Agent",
          detail: "Comparing available slots after 7 PM across theaters",
          icon: Timer
        },
        {
          title: "Route Planning",
          status: "pending",
          agent: "Navigation Agent",
          detail: "Will calculate transit options and parking availability",
          icon: Navigation
        },
        {
          title: "Booking Preparation",
          status: "pending",
          agent: "Transaction Agent",
          detail: "Will prepare booking interface for selected showtime",
          icon: Ticket
        }
      ]
    },
    {
      id: "2",
      query: "Compare prices for a 65-inch OLED TV with delivery and installation",
      timestamp: "2 minutes ago",
      domain: "Shopping",
      subtasks: [
        {
          title: "Product Research",
          status: "complete",
          agent: "Research Agent",
          detail: "Identified top-rated 65\" OLED models from LG, Sony, and Samsung",
          icon: Search
        },
        {
          title: "Price Comparison",
          status: "active",
          agent: "Shopping Agent",
          detail: "Analyzing prices across 6 major retailers including delivery fees",
          icon: ShoppingCart
        },
        {
          title: "Service Verification",
          status: "pending",
          agent: "Service Agent",
          detail: "Will check installation service availability in your area",
          icon: Briefcase
        },
        {
          title: "Payment Options",
          status: "pending",
          agent: "Finance Agent",
          detail: "Will compile available financing and payment plans",
          icon: CreditCard
        }
      ]
    },
    {
      id: "3",
      query: "Plan a weekend trip to wine country with pet-friendly accommodations",
      timestamp: "5 minutes ago",
      domain: "Travel",
      subtasks: [
        {
          title: "Destination Research",
          status: "complete",
          agent: "Travel Agent",
          detail: "Identified Napa and Sonoma Valley as primary options",
          icon: MapPin
        },
        {
          title: "Pet Policy Verification",
          status: "active",
          agent: "Accommodation Agent",
          detail: "Checking pet policies at boutique hotels and B&Bs",
          icon: Building2
        },
        {
          title: "Transportation Options",
          status: "active",
          agent: "Transport Agent",
          detail: "Comparing car rental rates with pet-friendly policies",
          icon: Car
        },
        {
          title: "Itinerary Planning",
          status: "pending",
          agent: "Planning Agent",
          detail: "Will create weekend schedule with pet-friendly wineries",
          icon: Timer
        }
      ]
    }
  ];

  const toggleTask = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const handleEditSubtask = (taskId: string, subtaskIndex: number) => {
    setEditingSubtask({ taskId, subtaskIndex });
  };

  const handleAddContext = (taskId: string) => {
    // Implement context addition logic
    console.log('Adding context to task:', taskId);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      {tasks.map(task => (
        <Card key={task.id} className="bg-white/10 border-none">
          <CardBody className="p-0">
            {/* Task Header */}
            <div className="p-4 flex items-start gap-3 cursor-pointer hover:bg-white/5">
              <div 
                className="mt-1 text-white/60"
                onClick={() => toggleTask(task.id)}
              >
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
                      variant="flat"
                      isIconOnly
                      className="bg-white/10 text-white/60"
                      onClick={() => handleAddContext(task.id)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Chip
                      size="sm"
                      variant="flat"
                      classNames={{
                        base: "bg-white/10 text-white/60",
                        content: "text-xs"
                      }}
                    >
                      {task.domain}
                    </Chip>
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

            {/* Subtasks */}
            {expandedTasks.has(task.id) && (
              <>
                <div className="bg-white/5 p-4 pl-11 space-y-4">
                  {task.subtasks.map((subtask, idx) => (
                    <div key={idx}>
                      <div className="flex gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer group">
                        <div className="mt-1">
                          {subtask.icon && (
                            <subtask.icon className="w-4 h-4 text-white/40" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-white/90">{subtask.title}</span>
                              <div className={`w-2 h-2 rounded-full ${
                                subtask.status === 'complete' ? 'bg-green-400' :
                                subtask.status === 'active' ? 'bg-blue-400' :
                                'bg-white/30'
                              }`} />
                            </div>
                            <Button
                              size="sm"
                              variant="flat"
                              isIconOnly
                              className="opacity-0 group-hover:opacity-100 bg-white/10 text-white/60"
                              onClick={() => handleEditSubtask(task.id, idx)}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="text-sm text-white/60 mt-1">
                            {subtask.detail}
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-xs text-white/50">
                            <Bot className="w-3 h-3" />
                            {subtask.agent}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardBody>
        </Card>
      ))}
    </div>
  );
}