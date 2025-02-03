"use client";

import { useState } from "react";
import { SearchBar } from "@/app/componentsV2/SearchBar";
import TaskList from "@/app/componentsV2/TaskList";
import Sidebar from "@/app/componentsV2/Sidebar";
import { useTaskProcessing } from "@/hooks/useTaskProcessing";
import { Task, TaskStatus } from "@/types/types";

export default function Home() {
  const [isSearching, setIsSearching] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const { processQuery, isLoading } = useTaskProcessing();

  const handleSearch = async (query: string) => {
    // Create a placeholder task
    const placeholderTask: Task = {
      task_id: `placeholder_${Date.now().toString()}`,
      query,
      timestamp: "Just now",
      domain: "Processing...",
      needsClarification: false,
      subtasks: [],
      status: TaskStatus.PENDING,
    };

    setTasks((currentTasks) => [placeholderTask, ...currentTasks]);
    setIsSearching(false);

    // Process the query
    const result = await processQuery(query);
    if (result) {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.task_id === placeholderTask.task_id ? result : task
        )
      );
    } else {
      setTasks((currentTasks) =>
        currentTasks.filter(
          (task) => task.task_id !== placeholderTask.task_id
        )
      );
    }
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.task_id === updatedTask.task_id ? updatedTask : task
      )
    );
  };

  return (
    <div className="flex min-h-screen [border:none] [outline:none] overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      <main className="flex-1 relative">
        {/* Background Video Container */}
        <div className="fixed inset-0">
          <div
            className="relative w-full h-full transition-filter duration-500"
            style={{ filter: isSearching ? "blur(0px)" : "blur(16px)" }}
          >
            <video
              muted
              autoPlay
              loop
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
            >
              <source src="/vishva-bg-4.mp4" type="video/mp4" />
            </video>
          </div>
          <div
            className="absolute inset-0 bg-black transition-opacity duration-500"
            style={{ opacity: isSearching ? 0.15 : 0.5 }}
          />
        </div>

        {/* Main Content Container */}
        <div className="relative z-30 flex flex-col items-center justify-center min-h-screen px-4">
          {isSearching ? (
            // Searching State: Title and Search Bar
            <div className="flex flex-col items-center transition-opacity duration-500">
              <div className="text-center">
                <p className="text-2xl font-bold text-white/70">INTRODUCING</p>
                <h1 className="text-[120px] font-semibold text-white leading-none">
                  VISHVA
                </h1>
              </div>
              {/* The search bar now spans a wider container */}
              <div className="mt-8 w-1/2 min-w-[900px]">
                <SearchBar onSearch={handleSearch} />
              </div>
            </div>
          ) : (
            // Task List State: TaskList and "New Search" Button
            <div className="flex flex-col items-center transition-opacity duration-500 w-full">
              <div className="w-full max-w-4xl">
                <TaskList
                  tasks={tasks}
                  onTaskUpdate={handleTaskUpdate}
                  isLoading={isLoading}
                />
              </div>
              <button
                className="mt-4 backdrop-blur-xl bg-white/10 border border-white/20 text-white/60 
                           px-4 py-2 rounded-lg hover:bg-white/20 transition-opacity duration-500"
                onClick={() => setIsSearching(true)}
              >
                New Search
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}