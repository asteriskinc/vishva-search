// YouTubePreview.tsx
import React from "react";

interface YouTubePreviewProps {
  videoId: string;
}

const YouTubePreview: React.FC<YouTubePreviewProps> = ({ videoId }) => {
  return (
    <div className="mt-4">
      <iframe
        width="100%"
        height="315"
        src={`https://www.youtube.com/embed/${videoId}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="rounded-lg" // Add rounded corners to the iframe
      ></iframe>
    </div>
  );
};

export default YouTubePreview;
