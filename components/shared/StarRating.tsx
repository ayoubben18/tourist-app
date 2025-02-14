import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ 
  rating, 
  onRatingChange, 
  disabled = false 
}: { 
  rating: number; 
  onRatingChange: (rating: number) => void;
  disabled?: boolean;
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          className={`p-1 transition-colors ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'}`}
          onMouseEnter={() => !disabled && setHoverRating(star)}
          onMouseLeave={() => !disabled && setHoverRating(0)}
          onClick={() => !disabled && onRatingChange(star)}
        >
          <Star
            className={`w-6 h-6 ${
              (hoverRating ? hoverRating >= star : rating >= star)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-none text-yellow-400'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;