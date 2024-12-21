"use client"
import { Input, Button } from "@nextui-org/react";
import { Search, Send, Compass, Zap, Settings } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const query = formData.get('query') as string;
    if (query) onSearch(query);
  };

  return (
    <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 shadow-xl border border-white/20">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          name="query"
          placeholder="What can Vishva accomplish for you today?"
          classNames={{
            input: "bg-transparent text-white/90 placeholder:text-white/60",
            inputWrapper: "bg-white/5 border-white/20 hover:bg-white/10 group-data-[focused=true]:bg-white/10",
          }}
          startContent={<Search className="text-indigo-400" size={20} />}
        />
        
        <div className="flex gap-4 mt-2 ml-2">
          <div className="flex gap-4">
            <Button
              isIconOnly
              className="w-10 h-10 backdrop-blur-xl bg-white/5 border border-white/20 hover:bg-white/10 group dark"
              radius="lg"
            >
              <Compass className="text-indigo-400 group-hover:text-indigo-300 transition-colors" size={20} />
            </Button>
            <Button
              isIconOnly
              className="w-10 h-10 backdrop-blur-xl bg-white/5 border border-white/20 hover:bg-white/10 group dark"
              radius="lg"
            >
              <Zap className="text-indigo-400 group-hover:text-indigo-300 transition-colors" size={20} />
            </Button>
            <Button
              isIconOnly
              className="w-10 h-10 backdrop-blur-xl bg-white/5 border border-white/20 hover:bg-white/10 group dark"
              radius="lg"
            >
              <Settings className="text-indigo-400 group-hover:text-indigo-300 transition-colors" size={20} />
            </Button>
          </div>

          <Button
            type="submit"
            className="w-10 h-10 backdrop-blur-xl bg-white/5 border border-white/20 hover:bg-white/10 ml-auto group dark"
            radius="lg"
          >
            <Send className="text-indigo-400 group-hover:text-indigo-300 transition-colors" size={20} />
          </Button>
        </div>
      </form>
    </div>
  );
};