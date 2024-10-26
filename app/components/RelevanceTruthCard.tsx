import React from "react";
import { Card, CardBody, Avatar, Progress } from "@nextui-org/react";
import { Scale, Shield, User, AlertTriangle } from "lucide-react";

interface Author {
  name: string;
  credentials?: string;
  affiliation?: string;
  imageUrl?: string;
  verificationStatus?: "verified" | "unverified" | "expert";
}

interface ContentMetrics {
  /** Relevance score (0-100) */
  relevanceScore: number;
  /** Truth score (0-100) */
  truthScore: number;
  /** Bias level (-100 to 100, 0 being neutral) */
  biasLevel: number;
  /** Author information if available */
  author?: Author;
  /** Citations and fact checks */
  factChecks?: number;
}

interface RelevanceTruthCardProps {
  metrics: ContentMetrics;
  isHovered?: boolean;
  className?: string;
}

const RelevanceTruthCard: React.FC<RelevanceTruthCardProps> = ({
  metrics,
  isHovered = false,
  className = ""
}) => {
  const getBiasLabel = (bias: number) => {
    if (bias < -60) return { label: "Strong Left", color: "text-blue-500" };
    if (bias < -20) return { label: "Moderate Left", color: "text-blue-400" };
    if (bias < 20) return { label: "Neutral", color: "text-green-400" };
    if (bias < 60) return { label: "Moderate Right", color: "text-orange-400" };
    return { label: "Strong Right", color: "text-red-500" };
  };

  const biasInfo = getBiasLabel(metrics.biasLevel);

  return (
    <div 
      className={`absolute  left-[46%] -top-[160%]  transition-all duration-300 ${
        isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
      } ${className}`}
    >
      <Card className="backdrop-blur-sm bg-gray-900/40">
        <CardBody>
          <div className="space-y-6">
            {/* Radial Progress Meters */}
            <div className="flex justify-between items-center">
              {/* Relevance Score */}
              <div className="flex flex-col items-center">
                <div className="radial-progress bg-primary/20 text-primary-content border-4 border-primary/30" 
                  style={{ 
                    "--value": metrics.relevanceScore, 
                    "--size": "3rem",
                    "--thickness": "3px"
                  } as any}>
                  <span className="text-sm">{metrics.relevanceScore}%</span>
                </div>
                <span className="text-xs text-gray-400 mt-1">Relevance</span>
              </div>

              {/* Truth Score */}
              <div className="flex flex-col items-center">
                <div className="radial-progress bg-success/20 text-success-content border-4 border-success/30" 
                  style={{ 
                    "--value": metrics.truthScore, 
                    "--size": "3rem",
                    "--thickness": "3px"
                  } as any}>
                  <span className="text-sm">{metrics.truthScore}%</span>
                </div>
                <span className="text-xs text-gray-400 mt-1">Truth</span>
              </div>

              {/* Fact Checks */}
              {metrics.factChecks && (
                <div className="flex flex-col items-center">
                  <div className="stats bg-transparent shadow">
                    <div className="stat p-2">
                      <div className="stat-figure text-secondary">
                        <Shield size={16} />
                      </div>
                      <div className="stat-value text-sm">{metrics.factChecks}</div>
                      <div className="stat-desc text-xs">Fact Checks</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bias Indicator */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span>Left</span>
                <span className={biasInfo.color}>{biasInfo.label}</span>
                <span>Right</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-green-400 to-red-500"
                  style={{ 
                    width: '100%',
                    clipPath: `inset(0 ${50 - (metrics.biasLevel / 2)}% 0 ${50 + (metrics.biasLevel / 2)}%)`
                  }}
                />
              </div>
            </div>

            {/* Author Information */}
            {metrics.author && (
              <div className="flex items-center gap-3 border-t border-gray-700/50 pt-4">
                <Avatar
                  src={metrics.author.imageUrl}
                  fallback={<User size={20} />}
                  size="sm"
                />
                <div className="flex-grow">
                  <p className="text-sm font-medium text-gray-300">
                    {metrics.author.name}
                  </p>
                  {metrics.author.credentials && (
                    <p className="text-xs text-gray-400">
                      {metrics.author.credentials}
                    </p>
                  )}
                  {metrics.author.affiliation && (
                    <p className="text-xs text-gray-400">
                      {metrics.author.affiliation}
                    </p>
                  )}
                </div>
                {metrics.author.verificationStatus === "expert" && (
                  <Shield className="text-green-400" size={16} />
                )}
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default RelevanceTruthCard;