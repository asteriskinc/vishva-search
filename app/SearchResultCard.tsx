// @ts-nocheck
import React, { useState } from "react";
import { Card, CardBody, Image, Skeleton, Badge } from "@nextui-org/react";
import { Clock, Users, Award, ExternalLink, BarChart2 } from "lucide-react";
import ContentAnalysisCard from "./ContentAnalysisCard";
import AuthorityMetricsCard from "./AuthorityMetricsCard";
import ResourceAvailabilityCard from "./ResourcesAvailabiltyCard";
import RelevanceTruthCard from "./RelevanceTruthCard";

const SearchResultCard = ({
  title,
  displayLink,
  link,
  snippet,
  imageUrl,
  contentType = "Blog Post",
  wordCount = "1,200",
  lastUpdated = "2 days ago",
  authorityMetrics = {
    domainAuthority: 85,
    citations: 127,
    expertVerified: true,
    socialShares: 1542,
    academicReferences: 3
  },
  resources={
    videos: { count: 2 },
    tools: { count: 1 },
    downloads: { count: 3, totalSize: 15.4 },
    codeSnippets: { count: 8 }
  },
  relevanceMetrics={
    relevanceScore: 92,
    truthScore: 85,
    biasLevel: -15,
    factChecks: 12,
    author: {
      name: "Dr. Jane Smith",
      credentials: "Ph.D. in Computer Science",
      affiliation: "Stanford University",
      imageUrl: "/path/to/image.jpg",
      verificationStatus: "expert"
    }
  }
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getContentTypeColor = (type) => {
    const colors = {
      "Blog Post": "bg-purple-500",
      "Academic": "bg-blue-500",
      "News": "bg-green-500",
      "Landing Page": "bg-yellow-500",
      "Documentation": "bg-red-500"
    };
    return colors[type] || "bg-gray-500";
  };

  return (
    <div className="relative flex justify-start w-full">
      <div className="flex gap-4 w-full">
        {/* Main Result Card - 45% */}
        <div className="relative w-[45%]">
          <Card 
            className="bg-gray-900/30 hover:bg-gray-800/50 transition-all duration-300"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <CardBody className="flex flex-row gap-4">
              <div className="flex-grow">
                <h2 className="text-xl font-bold text-blue-400 mb-1">
                  {title}
                </h2>
                <p className="text-sm text-gray-400 mb-1">
                  {displayLink}
                </p>
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline mb-2 block"
                >
                  {link}
                </a>
                <p className="text-sm text-gray-300 mb-4">
                  {snippet}
                </p>
              </div>
              <div className="flex-shrink-0">
                <Image
                  alt={`${title} thumbnail`}
                  className="rounded-md object-cover w-16 h-16"
                  src={imageUrl}
                />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Intent Summary Card - 30% */}
        <ContentAnalysisCard 
          contentType={contentType}
          lastUpdated={lastUpdated}
          wordCount={wordCount}
          isHovered={isHovered}
        />

        {/* Relevance Truth Card - 23% */}
        <RelevanceTruthCard 
          metrics={relevanceMetrics}
          isHovered={isHovered}
        />
        
        {/* Authority Metrics Card - 25% */}
        <AuthorityMetricsCard 
          metrics={{
            domainAuthority: 85,
            citations: 127,
            socialShares: 1542,
            academicReferences: 3,
            expertVerified: true
          }}
          isHovered={isHovered}
        />

        {/* Resource Availability Card */}
        <ResourceAvailabilityCard 
            resources={resources}
            isHovered={isHovered}
        />
      </div>
    </div>
  );
};

export default SearchResultCard;