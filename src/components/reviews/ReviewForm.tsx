import { useState } from 'react';
import { StarRating } from './StarRating';
import { Send, X } from 'lucide-react';

interface ReviewFormProps {
  onSubmit: (rating: number, comment: string) => Promise<void>;
  onCancel?: () => void;
  providerName: string;
  caretakerName?: string;
}

export function ReviewForm({ onSubmit, onCancel, providerName, caretakerName }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a star rating');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await onSubmit(rating, comment);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-lavender-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-purple-900 mb-1">
            Rate Your Experience
          </h3>
          <p className="text-sm text-purple-700">
            How was your experience with {caretakerName || providerName}?
          </p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Star Rating */}
        <div>
          <label className="block mb-2">
            <span className="text-sm font-semibold text-purple-900">
              Your Rating *
            </span>
          </label>
          <StarRating
            rating={rating}
            size="lg"
            interactive
            onChange={setRating}
          />
          {rating > 0 && (
            <p className="text-sm text-purple-700 mt-2">
              {rating === 5 && '⭐ Excellent!'}
              {rating === 4 && '👍 Very Good'}
              {rating === 3 && '😊 Good'}
              {rating === 2 && '😐 Fair'}
              {rating === 1 && '😞 Poor'}
            </p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="block mb-2">
            <span className="text-sm font-semibold text-purple-900">
              Your Review
            </span>
            <span className="text-sm text-purple-500 ml-1">(Optional)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Share details of your experience..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-lavender-300 focus:outline-none resize-none"
            maxLength={500}
          />
          <p className="text-xs text-purple-500 mt-1">
            {comment.length}/500 characters
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || rating === 0}
          className="w-full bg-purple-800 text-white rounded-xl py-3 font-semibold shadow-lg hover:bg-purple-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Review
            </>
          )}
        </button>
      </form>
    </div>
  );
}