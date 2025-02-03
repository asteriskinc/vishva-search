import { Input } from "@nextui-org/react";
import { Search, Send, Compass, Zap, Settings, Mic } from "lucide-react";
import { useState, useEffect } from 'react';
import { SearchBarProps } from '@/types/types';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const { 
    isListening, 
    isConnecting, 
    transcript, 
    startListening, 
    stopListening,
    isSupported 
  } = useSpeechRecognition();

  // Update query when transcript changes
  useEffect(() => {
    if (transcript) {
      setQuery(transcript);
    }
  }, [transcript]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (isListening) {
      stopListening();
    }

    onSearch(query);
    setQuery('');
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const getMicButtonClasses = () => {
    if (isConnecting) {
      return "bg-white/20 text-white animate-pulse";
    }
    if (isListening) {
      return "bg-white text-black shadow-lg shadow-white/20";
    }
    return "text-white/60 hover:text-white";
  };

  const buttonBaseClasses = "w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200";

  return (
    <div className="backdrop-blur-md bg-white/10 rounded-3xl p-6 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.8)] border-1.5 border-white/20">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          name="query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What can Vishva accomplish for you today?"
          classNames={{
            input: "bg-transparent text-white/90 placeholder:text-white/60",
            inputWrapper: [
              "bg-white/10 border-white/20 hover:bg-white/10",
              "group-data-[focused=true]:bg-white/10",
              "shadow-[0_8px_12px_-1px_rgba(0,0,0,0.3)]"
            ].filter(Boolean).join(" "),
          }}
          startContent={<Search className="text-white" size={20} />}
        />
        
        <div className="flex px-2">
          <div className="flex gap-3">
            <button 
              type="button"
              className={`${buttonBaseClasses} text-white/60 hover:text-white`}
            >
              <Compass size={20} />
            </button>
            <button 
              type="button"
              className={`${buttonBaseClasses} text-white/60 hover:text-white`}
            >
              <Zap size={20} />
            </button>
            <button 
              type="button"
              className={`${buttonBaseClasses} text-white/60 hover:text-white`}
            >
              <Settings size={20} />
            </button>
          </div>

          <div className="flex gap-3 ml-auto">
            {isSupported && (
              <button 
                type="button"
                onClick={handleMicClick}
                className={`${buttonBaseClasses} ${getMicButtonClasses()}`}
                title={isConnecting ? "Connecting..." : isListening ? "Stop listening" : "Start voice input"}
              >
                <Mic size={20} />
                {isConnecting && (
                  <span className="sr-only">Connecting microphone...</span>
                )}
              </button>
            )}
            <button 
              type="submit"
              className={`${buttonBaseClasses} text-white/60 hover:text-white`}
            >
              <Send size={20} />
            </button>
          </div>
        </div>

        {/* Status Message */}
        {isConnecting && (
          <div className="text-center text-sm text-white/60 animate-pulse">
            Connecting microphone...
          </div>
        )}
      </form>
    </div>
  );
};