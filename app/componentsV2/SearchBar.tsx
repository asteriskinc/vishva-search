"use client"
import { Input, Button } from "@nextui-org/react";
import { Search, Send, Compass, Zap, Settings } from "lucide-react";
import { useState } from 'react';
import { SearchBarProps } from '@/types/types';


export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    onSearch(query);
    setQuery(''); 
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
            ].filter(Boolean).join(" "),
          }}
          startContent={<Search className="text-white" size={20} />}
        />
        
        <div className="flex gap-4 mt-2 ml-2">
          <div className="flex gap-4">
            <Button
              isIconOnly
              className="w-10 h-10 backdrop-blur-xl bg-white/5 border border-white/20 hover:bg-white/10 group dark"
              radius="lg"
            >
              <Compass className="text-white group-hover:text-white transition-colors" size={20} />
            </Button>
            <Button
              isIconOnly
              className="w-10 h-10 backdrop-blur-xl bg-white/5 border border-white/20 hover:bg-white/10 group dark"
              radius="lg"
            >
              <Zap className="text-white group-hover:text-white transition-colors" size={20} />
            </Button>
            <Button
              isIconOnly
              className="w-10 h-10 backdrop-blur-xl bg-white/5 border border-white/20 hover:bg-white/10 group dark"
              radius="lg"
            >
              <Settings className="text-white group-hover:text-white transition-colors" size={20} />
            </Button>
          </div>

          <Button
            type="submit"
            className="w-10 h-10 backdrop-blur-xl bg-white/5 border border-white/20 hover:bg-white/10 ml-auto group dark"
            radius="lg"
          >
            <Send className="text-white group-hover:text-white transition-colors" size={20} />
          </Button>
        </div>
      </form>
    </div>
  );
};