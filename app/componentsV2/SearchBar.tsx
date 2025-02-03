import { Textarea } from "@/components/ui/textarea";
import { Search, Send, Compass, Zap, Settings, Mic } from "lucide-react";
import { useState, useEffect, useRef } from 'react';
import { SearchBarProps } from '@/types/types';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { 
    isListening, 
    isConnecting, 
    transcript, 
    startListening, 
    stopListening,
    isSupported 
  } = useSpeechRecognition();

  // Auto-resize function with dynamic sizing
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '44px';
      const newHeight = textarea.scrollHeight;
      
      if (textarea.value.trim() === '') {
        textarea.style.height = '44px';
      } else {
        textarea.style.height = `${Math.min(newHeight, 500)}px`;
      }
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
    adjustTextareaHeight();
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [query]);

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
    
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '44px';
    }
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
    <div className="backdrop-blur-md bg-black/20 rounded-3xl p-6 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.8)] border-1.5 border-white/20">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative">
          <div className="absolute left-3 top-[11px] z-10">
            <Search className="text-white/60" size={20} />
          </div>
          <Textarea
            ref={textareaRef}
            value={query}
            onChange={handleContentChange}
            placeholder="What can Vishva accomplish for you today?"
            className="min-h-[44px] max-h-[500px] overflow-y-auto bg-black/20 border-white/30 
                       hover:bg-black/50 focus:bg-black/50 text-white/90 placeholder:text-white/60 
                       rounded-xl pl-10 pr-4 resize-none shadow-[0_8px_12px_-1px_rgba(0,0,0,0.3)] 
                       backdrop-blur-sm scrollbar-thin scrollbar-track-white/5 
                       scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20
                       transition-[height] duration-200 ease-in-out
                       text-[16px] placeholder:text-[16px]
                       leading-[22px] placeholder:leading-[22px]
                       py-[11px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            style={{ height: '44px' }}
          />
        </div>
        
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

        {isConnecting && (
          <div className="text-center text-sm text-white/60 animate-pulse">
            Connecting microphone...
          </div>
        )}
      </form>
    </div>
  );
};