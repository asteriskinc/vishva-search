import React, { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardBody, Skeleton, Chip } from "@nextui-org/react";
import { Clock, BarChart2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import { readStreamableValue } from "ai/rsc";
import { generate } from "@/utils/openaiStream";

type ContentType = "Blog Post" | "Academic" | "News" | "Landing Page" | "Documentation";

interface ContentAnalysisCardProps {
  /** The type of content being analyzed */
  contentType?: ContentType;
  /** When the content was last updated */
  lastUpdated?: string;
  /** Number of words in the content */
  wordCount?: string;
  /** Whether the parent card is being hovered */
  isHovered?: boolean;
  /** Optional CSS classes to override default styling */
  className?: string;
  /** URL of the content to analyze */
  url: string;
  /** Search query for context */
  query: string;
}

const ContentAnalysisCard: React.FC<ContentAnalysisCardProps> = ({
  contentType = "Blog Post",
  lastUpdated = "2 days ago",
  wordCount = "1,200",
  isHovered = false,
  className = "",
  url,
  query
}) => {
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const hasStartedStreaming = useRef(false);

  const getChipColor = (type: ContentType): "warning" | "primary" | "success" | "secondary" | "danger" => {
    const colors: Record<ContentType, "warning" | "primary" | "success" | "secondary" | "danger"> = {
      "Blog Post": "secondary",
      "Academic": "primary",
      "News": "success",
      "Landing Page": "warning",
      "Documentation": "danger"
    };
    return colors[type] || "secondary";
  };

  const fetchStreamingSummary = useCallback(async () => {
    if (hasStartedStreaming.current) return;
    
    setIsLoading(true);
    setSummary("");
    hasStartedStreaming.current = true;

    try {
      const { output } = await generate(query, url);
      
      // Process the stream
      for await (const delta of readStreamableValue(output)) {
        setSummary(prev => prev + delta);
      }
    } catch (error) {
      console.error("Error fetching streaming summary:", error);
      setSummary("Failed to generate summary.");
    } finally {
      setIsLoading(false);
    }
  }, [query, url]);

  useEffect(() => {
    if (isHovered && !hasStartedStreaming.current) {
      fetchStreamingSummary();
    }
  }, [isHovered, fetchStreamingSummary]);

  // Reset streaming state when URL changes
  useEffect(() => {
    hasStartedStreaming.current = false;
    setSummary("");
    setIsLoading(false);
  }, [url]);

  return (
    <div 
      className={`absolute left-[46%] w-[30%] transition-all duration-300 ${
        isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
      } ${className}`}
    >
      <Card 
        classNames={{
          base: "backdrop-blur-sm bg-gray-900/40"
        }}
      >
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-400">
              Content Analysis
            </h3>
            <Chip
              variant="dot"
              color={getChipColor(contentType as ContentType)}
              size="sm"
            >
              {contentType}
            </Chip>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Clock size={14} />
            <span>{lastUpdated}</span>
            <span className="mx-2">•</span>
            <BarChart2 size={14} />
            <span>{wordCount} words</span>
          </div>

          <div className="space-y-3">
            {isLoading && !summary ? (
              // Show skeletons only when loading and no summary yet
              <>
                {[...Array(7)].map((_, index) => (
                  <Skeleton 
                    key={index}
                    className="rounded-lg"
                    classNames={{
                      base: "bg-default-200",
                    }}
                  >
                    <div className="h-3 w-full"></div>
                  </Skeleton>
                ))}
              </>
            ) : (
              // Show the streaming summary
              <div className="text-sm text-gray-300">
                <ReactMarkdown
                  rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
                  components={{
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2" {...props} />,
                    li: ({node, ...props}) => <li className="mb-2" {...props} />,
                  }}
                  className="markdown-content break-words"
                >
                  {summary || 'Generating summary...'}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ContentAnalysisCard;