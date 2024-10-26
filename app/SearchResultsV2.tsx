import React from "react";
import { Spinner } from "@nextui-org/react";
import SearchResultCard from "./SearchResultCard";

interface SearchResultV2 {
  displayLink: string;
  link: string;
  title: string;
  snippet: string;
  pagemap?: {
    cse_image?: Array<{ src: string }>;
    cse_thumbnail?: Array<{ src: string }>;
  };
}

interface SearchResultV2Props {
  query: string;
  results: SearchResultV2[];
  loading: boolean;
  showChat: boolean;
  setShowChat: React.Dispatch<React.SetStateAction<boolean>>;
}

const SearchResultsV2: React.FC<SearchResultV2Props> = ({
  query,
  results,
  loading,
  showChat,
  setShowChat
}) => {
  const getImageUrl = (result: SearchResultV2) => {
    return result.pagemap?.cse_thumbnail?.[0]?.src || 
           result.pagemap?.cse_image?.[0]?.src || 
           '/api/placeholder/60/60';
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="relative w-full space-y-4 pt-4">
      {results.map((result, index) => (
        <SearchResultCard
          key={`${result.link}-${index}`}
          title={result.title}
          displayLink={result.displayLink}
          link={result.link}
          snippet={result.snippet}
          imageUrl={getImageUrl(result)}
          query={query}
        />
      ))}
    </div>
  );
};

export default SearchResultsV2;