import React, { useState } from 'react';
import { PanelLeft, ChevronLeft, Settings, Search, HelpCircle, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div 
      className={`fixed left-0 top-0 h-full transition-all duration-300 ease-in-out z-40 ${isCollapsed ? 'w-16' : 'w-1/6'}`}
    >
      {/* Background effects layer: Render only when expanded */}
      {!isCollapsed && (
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.5), transparent)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              maskImage: 'linear-gradient(to right, black 30%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, black 30%, transparent 100%)'
            }}
          />
        </div>
      )}
      
      {/* Content */}
      <div className="relative h-full flex flex-col">
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          {!isCollapsed && <span className="text-white/90 font-semibold">VISHVA</span>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white/60 hover:text-white hover:bg-transparent"
          >
            {isCollapsed ? (
              <PanelLeft className="w-8 h-8" strokeWidth={3} />
            ) : (
              <ChevronLeft className="w-8 h-8" strokeWidth={3} />
            )}
          </Button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-2 flex flex-col">
          {/* Top Buttons */}
          <div className="space-y-2">
            {/* New Chat Button */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-white/60 hover:text-white hover:bg-transparent group"
            >
              <Plus className="w-8 h-8 group-hover:scale-110 transition-transform" strokeWidth={3} />
              {!isCollapsed && <span>New Chat</span>}
            </Button>

            {/* Search Button */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-white/60 hover:text-white hover:bg-transparent group"
            >
              <Search className="w-8 h-8 group-hover:scale-110 transition-transform" strokeWidth={3} />
              {!isCollapsed && <span>Search</span>}
            </Button>
          </div>

          {/* History Glass Section */}
          {!isCollapsed && (
            <div className="mt-4 flex-grow">
              <div 
                className="p-4 rounded-lg bg-black/30 backdrop-blur-md w-full max-w-none -mr-4 flex flex-col h-full border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
              >
                <div className="w-full text-center text-white/90 font-semibold">History</div>
                <div className="flex-grow flex items-center justify-center">
                  <div className="text-white/70 text-sm">No chats yet</div>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-2">
          <div className="space-y-2">
            {[
              { icon: HelpCircle, label: 'Help' },
              { icon: Settings, label: 'Settings' }
            ].map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="w-full justify-start gap-3 text-white/60 hover:text-white hover:bg-transparent group"
              >
                <item.icon className="w-8 h-8 group-hover:scale-110 transition-transform" strokeWidth={3} />
                {!isCollapsed && <span>{item.label}</span>}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
