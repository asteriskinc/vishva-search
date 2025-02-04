'use client'

import { useState } from "react"
import { SearchBar } from "@/app/componentsV2/SearchBar"
import TaskList from "@/app/componentsV2/TaskList"
import Sidebar from "@/app/componentsV2/Sidebar"
import { AuthButton } from "@/app/componentsV2/AuthButton"
import { useTaskProcessing } from "@/hooks/useTaskProcessing"
import { Task, TaskStatus } from "@/types/types"

export function MainContent({ initialSession }: { initialSession: any }) {
  const [isSearching, setIsSearching] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const { processQuery, isLoading } = useTaskProcessing()

  const handleSearch = async (query: string) => {
    const placeholderTask: Task = {
      task_id: `placeholder_${Date.now().toString()}`,
      query,
      timestamp: "Just now",
      domain: "Processing...",
      needsClarification: false,
      subtasks: [],
      status: TaskStatus.PENDING,
    }

    setTasks((currentTasks) => [placeholderTask, ...currentTasks])
    setIsSearching(false)

    const result = await processQuery(query)
    if (result) {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.task_id === placeholderTask.task_id ? result : task
        )
      )
    } else {
      setTasks((currentTasks) =>
        currentTasks.filter(
          (task) => task.task_id !== placeholderTask.task_id
        )
      )
    }
  }

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.task_id === updatedTask.task_id ? updatedTask : task
      )
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Auth Button */}
      <div className="absolute top-4 right-4 z-50">
        <AuthButton user={initialSession} />
      </div>

      {/* Background Video */}
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

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="relative z-30 flex flex-col items-center justify-center min-h-screen px-4">
        {isSearching ? (
          <div className="flex flex-col items-center transition-opacity duration-500">
            <div className="text-center">
              <p className="text-2xl font-bold text-white/70">INTRODUCING</p>
              <h1 className="text-[120px] font-semibold text-white leading-none">
                VISHVA
              </h1>
            </div>
            <div className="mt-8 w-1/2 min-w-[900px]">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>
        ) : (
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
    </div>
  )
}