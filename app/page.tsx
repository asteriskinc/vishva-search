"use client"
import { useState } from "react";
import { SearchBar } from "@/app/componentsV2/SearchBar";
import { TaskList } from "@/app/componentsV2/TaskList";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [isSearching, setIsSearching] = useState(true);
  
  const handleSearch = (query: string) => {
    setIsSearching(false);
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

      {/* Task List */}
      <AnimatePresence>
        {!isSearching && (
          <motion.div 
            className="fixed left-0 right-0 top-0 pt-8 px-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <TaskList />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Bar Container */}
      <motion.div
        className="fixed left-1/2 w-1/2"
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
    </main>
  );
}