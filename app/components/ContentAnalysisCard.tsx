import React from "react";
import { Card, CardBody, Skeleton, Chip } from "@nextui-org/react";
import { Clock, BarChart2 } from "lucide-react";

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
}

const ContentAnalysisCard: React.FC<ContentAnalysisCardProps> = ({
  contentType = "Blog Post",
  lastUpdated = "2 days ago",
  wordCount = "1,200",
  isHovered = false,
  className = ""
}) => {
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
            <Skeleton 
              className="rounded-lg"
              classNames={{
                base: "bg-default-200",
              }}
            >
              <div className="h-3 w-full"></div>
            </Skeleton>
            <Skeleton 
              className="rounded-lg"
              classNames={{
                base: "bg-default-200",
              }}
            >
              <div className="h-3 w-5/6"></div>
            </Skeleton>
            <Skeleton 
              className="rounded-lg"
              classNames={{
                base: "bg-default-200",
              }}
            >
              <div className="h-3 w-4/5"></div>
            </Skeleton>
            <Skeleton 
              className="rounded-lg"
              classNames={{
                base: "bg-default-200",
              }}
            >
              <div className="h-3 w-5/6"></div>
            </Skeleton>
            <Skeleton 
              className="rounded-lg"
              classNames={{
                base: "bg-default-200",
              }}
            >
              <div className="h-3 w-4/5"></div>
            </Skeleton> 
            <Skeleton 
              className="rounded-lg"
              classNames={{
                base: "bg-default-200",
              }}
            >
              <div className="h-3 w-5/6"></div>
            </Skeleton>
            <Skeleton 
              className="rounded-lg"
              classNames={{
                base: "bg-default-200",
              }}
            >
              <div className="h-3 w-4/5"></div>
            </Skeleton>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ContentAnalysisCard;