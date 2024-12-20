"use client"
import React from "react";
import { Input, Button, Textarea } from "@nextui-org/react";
import { Search, Settings, Compass, Zap, Info, Send, UserPlus } from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <div className="fixed inset-0">
        <video
          muted
          autoPlay
          loop
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
        >
          <source src="/vishva-bg-4.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/5"></div>
      </div>

      {/* Sign Up Button */}
      <div className="relative z-10 flex justify-end p-6">
        <Button
          isIconOnly
          className="w-10 h-10 backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          aria-label="Sign Up"
          variant="flat"
          radius="lg"
        >
          <UserPlus className="text-white/90" size={20} />
        </Button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen -mt-20">
        {/* Title Section */}
        <div className="text-center">
          <p className="text-2xl font-bold text-white/70">INTRODUCING</p>
          <h1 className="mb-2 text-8xl font-bold bg-gradient-to-r from-indigo-700 via-purple-600 to-amber-400 bg-clip-text text-transparent">
            VISHVA
          </h1>
        </div>

        {/* Search Bar Section */}
        <div className="w-full max-w-3xl">
          <div className="backdrop-blur-md bg-white/5 dark:bg-gray-900/20 rounded-3xl p-6 shadow-xl shadow-black/40 border border-white/10">
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <Input
                  placeholder="What would you like me to help you with?"
                  classNames={{
                    input: "bg-transparent text-white placeholder:text-gray-300",
                    inputWrapper: "bg-white/5 dark:bg-gray-900/20 border-white/10 hover:bg-white/10",
                    base: "h-8"
                  }}  
                  startContent={<Search className="text-gray-300" size={20} />}
                />
              </div>
              
              {/* Action Buttons inside search component */}
              <div className="flex gap-4 mt-2 ml-2">
                <div className="flex gap-4">
                  <Button
                    isIconOnly
                    className="w-10 h-10 backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    aria-label="Explore"
                    variant="flat"
                    radius="lg"
                  >
                    <Compass className="text-indigo-400" size={20} />
                  </Button>
                  <Button
                    isIconOnly
                    className="w-10 h-10 backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    aria-label="Quick Tasks"
                    variant="flat"
                    radius="lg"
                  >
                    <Zap className="text-indigo-400" size={20} />
                  </Button>
                  <Button
                    isIconOnly
                    className="w-10 h-10 backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    aria-label="Settings"
                    variant="flat"
                    radius="lg"
                  >
                    <Settings className="text-indigo-400" size={20} />
                  </Button>
                </div>

                {/* Send Button (right aligned) */}
                <Button
                  className="w-10 h-10 backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 transition-all ml-auto"
                  aria-label="Send"
                  variant="flat"
                  radius="lg"
                >
                  <Send className="text-white/90" size={20} />
                </Button>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}