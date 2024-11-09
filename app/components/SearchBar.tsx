// components/SearchBar.tsx
'use client';

import React, { useState } from 'react';
import { Input } from "@nextui-org/react";
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isProcessing: boolean;
}

export default function SearchBar({ onSearch, isProcessing }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isProcessing) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <Input
        type="text"
        placeholder="Ask Vishva anything..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={isProcessing}
        radius="lg"
        classNames={{
          input: "text-lg",
          inputWrapper: "bg-content2/40 backdrop-blur-lg hover:bg-content2/60 group-data-[focused=true]:bg-content2/60"
        }}
        endContent={
          <button 
            type="submit" 
            disabled={isProcessing}
            className="p-2 rounded-full hover:bg-content2/60 disabled:opacity-50"
          >
            <Search className="w-5 h-5" />
          </button>
        }
      />
    </form>
  );
}