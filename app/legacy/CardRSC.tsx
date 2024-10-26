import React, { useState, useCallback, useEffect } from "react";
import { Button, Image } from "@nextui-org/react";
import YouTubePreview from "../components/YouTubePreview";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import { readStreamableValue } from "ai/rsc";
import { generate } from "@/utils/openaiStream";
import PulseDiv from "../framerCustomDivs/PulseDiv";
import GridLoader from "react-spinners/GridLoader";
import { calculateRelevance, calculateTrustworthiness } from "@/utils/scoreCalculator";
import ScoreCard from "./ScoreCard";

interface CardRSCProps {
  query: string;
  websiteName: string;
  url: string;
  title: string;
  snippet: string;
  imageUrl: string;
  onPeekFurther: (url: string) => void;
}

const CardRSC: React.FC<CardRSCProps> = ({
  query,
  websiteName,
  url,
  title,
  snippet,
  imageUrl,
  onPeekFurther,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const handlePeekFurther = () => {
    onPeekFurther(url);
  };

  const getYouTubeVideoId = (url: string): string | null => {
    const match = url.match(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    );
    return match ? match[1] : null;
  };

  const videoId = getYouTubeVideoId(url);

  const fetchStreamingSummary = useCallback(async () => {
    setLoadingSummary(true);
    setSummary("");

    try {
      const { output } = await generate(query, url);
      for await (const delta of readStreamableValue(output)) {
        setSummary((currentSummary) => `${currentSummary}${delta}`);
      }
    } catch (error) {
      console.error("Error fetching streaming summary:", error);
    } finally {
      setLoadingSummary(false);
    }
  }, [query, url]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (!summary && !loadingSummary && !videoId) {
      fetchStreamingSummary();
    }
  }, [summary, loadingSummary, videoId, fetchStreamingSummary]);

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      className="w-full max-w-full overflow-hidden text-white transition-all duration-300 ease-in-out"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col">
        {/* Top section with image and content */}
        <div className="flex flex-nowrap mb-2">
          {/* Website Image */}
          <div className="mr-2 flex-shrink-0">
            <Image
              isBlurred
              src={imageUrl}
              alt={`${websiteName} thumbnail`}
              width={60}
              height={60}
              className="rounded-md object-cover"
              loading="lazy"
            />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-grow">
            <h2 className="mb-1 truncate text-xl font-bold text-blue-400">
              {title}
            </h2>
            <p className="mb-1 truncate text-sm text-gray-400">{websiteName}</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-2 block truncate text-sm text-blue-500 hover:underline"
            >
              {url}
            </a>
          </div>
        </div>

        {/* Expandable content with dynamic height - Full width */}
        <div
          className={`w-full text-gray-300 transition-all duration-300 ease-in-out ${
            isHovered ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden`}
        >
          {videoId && isHovered ? (
            <YouTubePreview videoId={videoId} />
          ) : (
            <>
              {loadingSummary || summary ? (
                <div className="w-full max-w-full">
                  <div className="flex items-center justify-between">
                    <p className="bg-gradient-to-r from-yellow-400 to-red-800 bg-clip-text text-lg font-bold text-transparent">
                      Intent Based Summary
                    </p>
                    <Button
                      color="success"
                      variant="shadow"
                      size="sm"
                      onClick={handlePeekFurther}
                    >
                      Explore
                    </Button>
                  </div>

                  <div className="mt-2 overflow-hidden rounded-lg border border-white/40 bg-transparent p-2">
                    {summary ? (
                      <ReactMarkdown
                        rehypePlugins={[
                          rehypeRaw,
                          rehypeSanitize,
                          rehypeHighlight,
                        ]}
                        components={{
                          ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2" {...props} />,
                          li: ({node, ...props}) => <li className="mb-2" {...props} />,
                        }}
                        className="markdown-content break-words"
                      >
                        {summary}
                      </ReactMarkdown>
                    ) : (
                      <PulseDiv duration={1.5} easing="easeInOut">
                        <div className="flex items-center justify-center space-x-2">
                          <GridLoader
                            aria-label="Loading Spinner"
                            color="#ffffff"
                            size={4}
                          />
                          <div className="text-lg font-bold">Thinking</div>
                        </div>
                      </PulseDiv>
                    )}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* The score card component */}    
    </div>
  );
};

export default CardRSC;
