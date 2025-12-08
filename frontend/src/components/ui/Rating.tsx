import React from "react";
import { Star } from "lucide-react";

interface RatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

const sizes = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

export const Rating: React.FC<RatingProps> = ({
  rating,
  maxRating = 5,
  size = "sm",
  showValue = true,
  className = "",
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, index) => (
          <Star
            key={index}
            className={`${sizes[size]} fill-yellow-400 text-yellow-400`}
          />
        ))}
        {hasHalfStar && (
          <Star className={`${sizes[size]} fill-yellow-200 text-yellow-400`} />
        )}
        {[...Array(maxRating - Math.ceil(rating))].map((_, index) => (
          <Star
            key={index + fullStars}
            className={`${sizes[size]} text-gray-300`}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-gray-700 ml-1">
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
};
