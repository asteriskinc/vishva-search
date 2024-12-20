"use client"
import React, { useState } from "react";
import { Textarea, Button, Tooltip, Chip } from "@nextui-org/react";
import SearchResultsV2 from "./SearchResultsV2";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [filters, setFilters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  const CX = process.env.NEXT_PUBLIC_GOOGLE_CX;

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setResults([]);
    setHasSearched(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&q=${encodeURIComponent(query)}`,
      );
      const data = await response.json();
      setResults(data.items || []);

      const filterResponse = await fetch("/api/filters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });
      const filterData = await filterResponse.json();
      setFilters(filterData.filters || []);
    } catch (error) {
      console.error("Error fetching search results or filters:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSearch();
    }
  };

  const handleChipClick = (filter: string) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter((f) => f !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };

  if (hasSearched) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        {/* Top search bar layout */}
        <div className="w-[45%] pl-4 py-4">
          <div className=" mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-4xl font-bebas font-bold text-white">
                VISHVA
              </h1>
              <p className="text-sm font-bebas text-gray-400">
                The Modern Search Engine
              </p>
            </div>
            
            <div className="w-full">
              <Textarea
                placeholder="Search through the vishva (Universe)..."
                minRows={1}
                maxRows={15}
                variant="bordered"
                size="lg"
                className=""
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />

              <div className="mt-4 flex flex-wrap gap-2">
                {filters.map((filter, index) => (
                  <Chip
                    key={index}
                    color="warning"
                    variant={selectedFilters.includes(filter) ? "faded" : "dot"}
                    onClick={() => handleChipClick(filter)}
                  >
                    {filter}
                  </Chip>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <Tooltip
                  content="Search like it's Google but see the magic"
                  placement="bottom"
                >
                  <Button
                    radius="sm"
                    color="warning"
                    size="sm"
                    variant="shadow"
                    isLoading={loading}
                    spinnerPlacement="end"
                    onClick={handleSearch}
                    disabled={loading}
                  >
                    {loading ? "Searching" : "Search ⌘ + Enter"}
                  </Button>
                </Tooltip>
                <Tooltip
                  content="Ask like it's ChatGPT (Coming soon)"
                  placement="bottom"
                >
                  <Button radius="sm" color="danger" size="sm" variant="flat">
                    Chat ⌥ + Enter
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="w-full px-4">
          <SearchResultsV2
            query={query}
            results={results}
            loading={loading}
            showChat={showChat}
            setShowChat={setShowChat}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Centered initial layout */}
      <div className="mx-auto w-[40%] px-4 pt-8 mt-[30vh]">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-full text-center">
            <h1 className="text-8xl font-bebas font-bold text-white">
              VISHVA
            </h1>
            <p className="font-bebas text-gray-400">
              The modern Search Engine
            </p>
          </div>
          
          <div className="w-full">
            <Textarea
              placeholder="Search through the vishva (Universe)..."
              minRows={1}
              maxRows={15}
              variant="bordered"
              size="lg"
              className="w-full"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <div className="mt-4 flex w-full gap-2">
              <Tooltip
                content="Search like it's Google but see the magic"
                placement="bottom"
              >
                <Button
                  radius="sm"
                  color="warning"
                  size="sm"
                  variant="shadow"
                  isLoading={loading}
                  spinnerPlacement="end"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? "Searching" : "Search ⌘ + Enter"}
                </Button>
              </Tooltip>
              <Tooltip
                content="Ask like it's ChatGPT (Coming soon)"
                placement="bottom"
              >
                <Button radius="sm" color="danger" size="sm" variant="flat">
                  Chat ⌥ + Enter
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}