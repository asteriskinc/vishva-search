import React from "react";
import { Card, CardBody, Image } from "@nextui-org/react";

interface ContextCardProps {
  websiteName: string;
  title: string;
  snippet: string;
  imageUrl: string;
}

const ContextCard: React.FC<ContextCardProps> = ({
  websiteName,
  title,
  snippet,
  imageUrl,
}) => {
  return (
    <Card className="w-40 min-w-[14rem] max-w-[14rem]">
      <CardBody className="p-3">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Image
              src={imageUrl}
              alt={websiteName}
              className="h-12 w-12 rounded-sm object-cover"
            />
          </div>
          <div className="min-w-0 flex-grow">
            <h4 className="truncate text-sm font-semibold text-blue-400">
              {title}
            </h4>
            <p className="mb-1 truncate text-xs text-gray-400">{websiteName}</p>
            <p className="line-clamp-2 text-xs text-gray-300">{snippet}</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ContextCard;