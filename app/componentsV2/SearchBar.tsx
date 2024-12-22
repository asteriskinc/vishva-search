"use client"
import { Input, Button } from "@nextui-org/react";
import { Search, Send, Compass, Zap, Settings } from "lucide-react";
import { useTaskProcessing } from '@/hooks/useTaskProcessing';
import { TaskResponse } from '@/app/api/process-query/route';
import { useState } from 'react';

interface SearchBarProps {
  onSearch: (task: TaskResponse) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const { processQuery, isLoading } = useTaskProcessing();
  const [query, setQuery] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const task = await processQuery(query);
    if (task) {
      onSearch(task);
      setQuery(''); // Clear input after successful submission
    }
  };

  return (
    <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 shadow-xl border border-white/20">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          name="query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What can Vishva accomplish for you today?"
          classNames={{
            input: "bg-transparent text-white/90 placeholder:text-white/60",
            inputWrapper: [
              "bg-white/5 border-white/20 hover:bg-white/10",
              "group-data-[focused=true]:bg-white/10",
              isLoading && "opacity-50 cursor-wait"
            ].filter(Boolean).join(" "),
          }}
          startContent={<Search className="text-indigo-400" size={20} />}
          disabled={isLoading}
        />
        
        <div className="flex gap-4 mt-2 ml-2">
          <div className="flex gap-4">
            <Button
              isIconOnly
              className="w-10 h-10 backdrop-blur-xl bg-white/5 border border-white/20 hover:bg-white/10 group dark"
              radius="lg"
              disabled={isLoading}
            >
              <Compass className="text-indigo-400 group-hover:text-indigo-300 transition-colors" size={20} />
            </Button>
            <Button
              isIconOnly
              className="w-10 h-10 backdrop-blur-xl bg-white/5 border border-white/20 hover:bg-white/10 group dark"
              radius="lg"
              disabled={isLoading}
            >
              <Zap className="text-indigo-400 group-hover:text-indigo-300 transition-colors" size={20} />
            </Button>
            <Button
              isIconOnly
              className="w-10 h-10 backdrop-blur-xl bg-white/5 border border-white/20 hover:bg-white/10 group dark"
              radius="lg"
              disabled={isLoading}
            >
              <Settings className="text-indigo-400 group-hover:text-indigo-300 transition-colors" size={20} />
            </Button>
          </div>

          <Button
            type="submit"
            className={`w-10 h-10 backdrop-blur-xl bg-white/5 border border-white/20 hover:bg-white/10 ml-auto group dark
              ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
            radius="lg"
            disabled={isLoading}
          >
            <Send className="text-indigo-400 group-hover:text-indigo-300 transition-colors" size={20} />
          </Button>
        </div>
      </form>
    </div>
  );
};