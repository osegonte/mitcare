import { StarRating } from './StarRating';
import type { ReviewWithClient } from '../../types';

interface ReviewCardProps {
  review: ReviewWithClient;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-lavender-200 flex items-center justify-center flex-shrink-0">
            <span className="text-lg sm:text-xl font-bold text-lavender-400">
              {review.client.full_name.charAt(0)}
            </span>
          </div>
          
          {/* Name & Date */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-purple-900 truncate">
              {review.client.full_name}
            </p>
            <p className="text-xs text-purple-500">
              {formatDate(review.created_at)}
            </p>
          </div>
        </div>
        
        {/* Stars */}
        <div className="flex-shrink-0">
          <StarRating rating={review.rating} size="sm" />
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="text-sm text-purple-700 leading-relaxed">
          {review.comment}
        </p>
      )}
    </div>
  );
}