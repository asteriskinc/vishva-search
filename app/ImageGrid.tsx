import React from "react";

interface ImageGridProps {
  images: string[];
}

const ImageGrid: React.FC<ImageGridProps> = ({ images }) => {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
      {images.map((image, index) => (
        <div key={index} className="flex justify-center">
          <img
            src={image}
            alt={`Image ${index + 1}`}
            className="h-40 w-40 rounded object-cover"
          />
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;
