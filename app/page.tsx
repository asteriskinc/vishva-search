"use client"

import { useState } from "react";
import { SearchBar } from "@/app/componentsV2/SearchBar";
import TaskList from "@/app/componentsV2/TaskList";
import { motion, AnimatePresence } from "framer-motion";
import { useTaskProcessing } from '@/hooks/useTaskProcessing';
import { Task, TaskStatus } from "@/types/types";

export default function Home() {
  const [isSearching, setIsSearching] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const { processQuery, isLoading } = useTaskProcessing();
  
  const handleSearch = async (query: string) => {
    // Create a placeholder task
    const placeholderTask: Task = {
      task_id: Date.now().toString(),
      query,
      timestamp: "Just now",
      domain: "Processing...",
      needsClarification: false,
      subtasks: [],
      status: TaskStatus.PENDING
    };
    
    setTasks(currentTasks => [placeholderTask, ...currentTasks]);
    setIsSearching(false);

    // Process the query
    const result = await processQuery(query);
    if (result) {
      setTasks(currentTasks => 
        currentTasks.map(task => 
          task.task_id === placeholderTask.task_id ? result : task
        )
      );
    } else {
      setTasks(currentTasks => 
        currentTasks.filter(task => task.task_id !== placeholderTask.task_id)
      );
    }
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(currentTasks => 
      currentTasks.map(task => 
        task.task_id === updatedTask.task_id ? updatedTask : task
      )
    );
  };

  return (
    <main className="relative min-h-screen">
      {/* Background Video Container with Blur */}
      <div className="fixed inset-0">
        <motion.div
          className="relative w-full h-full"
          animate={{
            filter: isSearching ? "blur(0px)" : "blur(16px)",
          }}
          transition={{ duration: 0.5 }}
        >
          <video
            muted
            autoPlay
            loop
            playsInline
            preload="auto"
            className="h-full w-full object-cover"
          >
            <source src="/vishva-bg-4.mp4" type="video/mp4" />
          </video>
        </motion.div>
        <motion.div 
          className="absolute inset-0 bg-black"
          initial={{ opacity: 0.15 }}
          animate={{ opacity: isSearching ? 0.15 : 0.5 }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Title Card */}
      <AnimatePresence>
        {isSearching && (
          <motion.div 
            className="fixed left-1/2 top-1/2 -translate-y-[120%] -translate-x-1/2 text-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-2xl font-bold text-white/70">INTRODUCING</p>
            <h1 className="mb-4 text-8xl bg-gradient-to-r font-semibold from-indigo-700 via-purple-600 to-amber-400 bg-clip-text text-transparent">
              VISHVA
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task List Container with Backdrop Blur */}
      <AnimatePresence>
        {!isSearching && tasks.length > 0 && (
          <motion.div 
            className="fixed left-0 right-0 top-0 pt-8 px-4 pb-32 overflow-y-auto max-h-screen"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <TaskList 
              tasks={tasks}
              onTaskUpdate={handleTaskUpdate}
              isLoading={isLoading}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Bar Container */}
      <motion.div
        className="fixed left-1/2 w-1/2 min-w-[600px]"
        initial={{ y: "50vh", x: "-50%" }}
        animate={{ 
          y: isSearching ? "50vh" : "calc(100vh - 12rem)",
          x: "-50%"
        }}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 30
        }}
      >
        <SearchBar onSearch={handleSearch} />
      </motion.div>

      {/* Return to Search Button */}
      <AnimatePresence>
        {!isSearching && (
          <motion.button
            className="fixed top-4 right-4 backdrop-blur-xl bg-white/10 border border-white/20 text-white/60 
                     px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
            onClick={() => setIsSearching(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            New Search
          </motion.button>
        )}
      </AnimatePresence>
    </main>
  );
}