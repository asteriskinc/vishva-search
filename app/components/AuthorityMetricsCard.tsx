import React from "react";
import { Card, CardBody } from "@nextui-org/react";
import { ExternalLink, Users, Award } from "lucide-react";

interface AuthorityMetrics {
  /** Domain authority score out of 100 */
  domainAuthority: number;
  /** Number of citations */
  citations: number;
  /** Number of social shares */
  socialShares: number;
  /** Number of academic references */
  academicReferences: number;
  /** Whether the content is expert verified */
  expertVerified: boolean;
}

interface AuthorityMetricsCardProps {
  /** Metrics data for the content */
  metrics: AuthorityMetrics;
  /** Whether the parent card is being hovered */
  isHovered?: boolean;
  /** Optional CSS classes to override default styling */
  className?: string;
}

const AuthorityMetricsCard: React.FC<AuthorityMetricsCardProps> = ({
  metrics,
  isHovered = false,
  className = ""
}) => {
  return (
    <div 
      className={`absolute left-[77%] w-[23%] transition-all duration-300 ${
        isHovered ? 'opacity-100 translate-x-0 delay-75' : 'opacity-0 -translate-x-4 pointer-events-none'
      } ${className}`}
    >
      <Card className="backdrop-blur-sm bg-gray-900/40">
        <CardBody>
          <h3 className="text-lg font-semibold text-blue-400 mb-4">
            Authority Metrics
          </h3>
          
          <div className="space-y-4">
            {/* Domain Authority */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Domain Authority</span>
              <div className="flex items-center">
                <span className="text-green-400 font-semibold">{metrics.domainAuthority}</span>
                <span className="text-gray-400 text-sm">/100</span>
              </div>
            </div>

            {/* Citations */}
            <div className="flex items-center gap-2">
              <ExternalLink size={16} className="text-blue-400" />
              <span className="text-sm text-gray-300">Citations:</span>
              <span className="text-blue-400 font-semibold">{metrics.citations}</span>
            </div>

            {/* Social Shares */}
            <div className="flex items-center gap-2">
              <Users size={16} className="text-purple-400" />
              <span className="text-sm text-gray-300">Social Shares:</span>
              <span className="text-purple-400 font-semibold">{metrics.socialShares.toLocaleString()}</span>
            </div>

            {/* Academic References */}
            <div className="flex items-center gap-2">
              <Award size={16} className="text-yellow-400" />
              <span className="text-sm text-gray-300">Academic References:</span>
              <span className="text-yellow-400 font-semibold">{metrics.academicReferences}</span>
            </div>

            {/* Expert Verified Badge */}
            {metrics.expertVerified && (
              <div className="mt-4 flex items-center gap-2 bg-green-500/20 p-2 rounded-md">
                <Award size={16} className="text-green-400" />
                <span className="text-sm text-green-400">Expert Verified</span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AuthorityMetricsCard;