import React, { useState } from "react";
import CardRSC from "./CardRSC";
import ChatWindow from "./chatComponents/chatWindow";

interface SearchResultProps {
  query: string;
  results: Array<any>;
  loading: boolean;
  showChat: boolean;
  setShowChat: React.Dispatch<React.SetStateAction<boolean>>;
}

const SearchResults: React.FC<SearchResultProps> = ({
  query,
  results,
  loading,
  showChat,
  setShowChat,
}) => {
  const [activeChatUrl, setActiveChatUrl] = useState<string | undefined>();
  const [activeContextInfo, setActiveContextInfo] = useState<
    Array<{
      websiteName: string;
      title: string;
      snippet: string;
      imageUrl: string;
    }>
  >([]);

  const handlePeekFurther = (
    url: string,
    contextInfo: {
      websiteName: string;
      title: string;
      snippet: string;
      imageUrl: string;
    },
  ) => {
    setActiveChatUrl(url);
    setActiveContextInfo((prevContextInfo) => [
      ...prevContextInfo,
      contextInfo,
    ]);
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setActiveChatUrl(undefined);
    setActiveContextInfo([]);
  };

  return (
    <div className="w-full">
      {results.length > 0 ? (
        <ul className="w-full p-0">
          <p className="my-2 text-2xl font-bold text-white">Results</p>
          {results.map((result, index) => (
            <li key={index} className="mb-2 w-full">
              <CardRSC
                query={query}
                websiteName={result.displayLink}
                url={result.link}
                title={result.title}
                snippet={result.snippet}
                imageUrl={
                  result.pagemap?.cse_image?.[0]?.src ||
                  result.pagemap?.cse_thumbnail?.[0]?.src ||
                  ""
                }
                onPeekFurther={(url) =>
                  handlePeekFurther(url, {
                    websiteName: result.displayLink,
                    title: result.title,
                    snippet: result.snippet,
                    imageUrl:
                      result.pagemap?.cse_image?.[0]?.src ||
                      result.pagemap?.cse_thumbnail?.[0]?.src ||
                      "",
                  })
                }
              />
            </li>
          ))}
        </ul>
      ) : (
        !loading && <p className="text-white"></p>
      )}
      {showChat && (
        <div className="fixed bottom-0 left-1/2 right-0 top-0 w-1/2 p-4">
          <ChatWindow
            url={activeChatUrl}
            onClose={handleCloseChat}
            contextInfo={activeContextInfo}
          />
        </div>
      )}
    </div>
  );
};

export default SearchResults;
