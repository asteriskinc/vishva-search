import React from "react";
import { Card, CardBody, Chip } from "@nextui-org/react";
import { 
  Video, 
  Calculator, 
  Download, 
  Code, 
  FileDown, 
  Play, 
  Cpu,
  FileCode,
  MousePointerClick
} from "lucide-react";

interface ResourceCount {
  /** Number of resources of this type */
  count: number;
  /** Total size in MB (for downloadable resources) */
  totalSize?: number;
}

interface ResourceMetrics {
  /** Video content available */
  videos?: ResourceCount;
  /** Interactive tools or calculators */
  tools?: ResourceCount;
  /** Downloadable files (PDFs, spreadsheets, etc.) */
  downloads?: ResourceCount;
  /** Code snippets or examples */
  codeSnippets?: ResourceCount;
}

interface ResourceAvailabilityCardProps {
  /** Resource metrics data */
  resources: ResourceMetrics;
  /** Whether the parent card is being hovered */
  isHovered?: boolean;
  /** Optional CSS classes to override default styling */
  className?: string;
}

const ResourceAvailabilityCard: React.FC<ResourceAvailabilityCardProps> = ({
  resources,
  isHovered = false,
  className = ""
}) => {
  const hasResources = Object.values(resources).some(resource => resource?.count > 0);

  return (
    <div 
      className={`absolute left-[46%] w-[30%] top-full mt-4 transition-all duration-300 ${
        isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
      } ${className}`}
    >
      <Card className="backdrop-blur-sm bg-gray-900/40">
        <CardBody>
          <div className="flex items-center gap-2 mb-4">
            <MousePointerClick size={18} className="text-blue-400" />
            <h3 className="text-lg font-semibold text-blue-400">
              Resources Available
            </h3>
          </div>

          <div className="space-y-4">
            {/* Videos */}
            {resources.videos && resources.videos.count > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video size={16} className="text-purple-400" />
                  <span className="text-sm text-gray-300">Video Content</span>
                </div>
                <div className="flex items-center gap-2">
                  <Chip
                    variant="flat"
                    color="secondary"
                    size="sm"
                    startContent={<Play size={12} />}
                  >
                    {resources.videos.count} Videos
                  </Chip>
                </div>
              </div>
            )}

            {/* Interactive Tools */}
            {resources.tools && resources.tools.count > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator size={16} className="text-green-400" />
                  <span className="text-sm text-gray-300">Interactive Tools</span>
                </div>
                <div className="flex items-center gap-2">
                  <Chip
                    variant="flat"
                    color="success"
                    size="sm"
                    startContent={<Cpu size={12} />}
                  >
                    {resources.tools.count} Tools
                  </Chip>
                </div>
              </div>
            )}

            {/* Downloads */}
            {resources.downloads && resources.downloads.count > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Download size={16} className="text-yellow-400" />
                  <span className="text-sm text-gray-300">Downloadable Resources</span>
                </div>
                <div className="flex items-center gap-2">
                  <Chip
                    variant="flat"
                    color="warning"
                    size="sm"
                    startContent={<FileDown size={12} />}
                  >
                    {resources.downloads.count} Files
                    {resources.downloads.totalSize && (
                      <span className="ml-1 text-xs">
                        ({resources.downloads.totalSize}MB)
                      </span>
                    )}
                  </Chip>
                </div>
              </div>
            )}

            {/* Code Snippets */}
            {resources.codeSnippets && resources.codeSnippets.count > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code size={16} className="text-blue-400" />
                  <span className="text-sm text-gray-300">Code Examples</span>
                </div>
                <div className="flex items-center gap-2">
                  <Chip
                    variant="flat"
                    color="primary"
                    size="sm"
                    startContent={<FileCode size={12} />}
                  >
                    {resources.codeSnippets.count} Snippets
                  </Chip>
                </div>
              </div>
            )}

            {/* No Resources Message */}
            {!hasResources && (
              <div className="text-sm text-gray-400 text-center py-2">
                No interactive resources available
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ResourceAvailabilityCard;