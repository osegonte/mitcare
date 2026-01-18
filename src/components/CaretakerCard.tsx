import { Star, Languages, Award, Clock } from 'lucide-react';
import type { Caretaker } from '../types';

interface CaretakerCardProps {
  caretaker: Caretaker;
  onSelect?: () => void;
  showSelectButton?: boolean;
}

export function CaretakerCard({ caretaker, onSelect, showSelectButton = false }: CaretakerCardProps) {
  const priceRange = `€${caretaker.hourly_rate_min}–${caretaker.hourly_rate_max}/hr`;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-purple-800 hover:shadow-lg transition-all">
      <div className="flex items-start gap-4">
        {/* Photo */}
        <div className="flex-shrink-0">
          {caretaker.photo_url ? (
            <img
              src={caretaker.photo_url}
              alt={caretaker.full_name}
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-lavender-200 flex items-center justify-center border-2 border-gray-200">
              <span className="text-2xl font-bold text-lavender-400">
                {caretaker.full_name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-purple-900 mb-1">
                {caretaker.full_name}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold text-purple-900">
                    {caretaker.rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-purple-500">
                    ({caretaker.total_reviews} reviews)
                  </span>
                </div>
                {caretaker.verified && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Verified
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-purple-800">{priceRange}</p>
            </div>
          </div>

          {/* Bio */}
          {caretaker.bio && (
            <p className="text-sm text-purple-700 mb-3 line-clamp-2">
              {caretaker.bio}
            </p>
          )}

          {/* Experience & Specializations */}
          <div className="flex flex-wrap gap-2 mb-3">
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
              <Clock className="w-3 h-3 text-gray-600" />
              <span className="text-gray-700 font-medium">
                {caretaker.years_experience} years exp.
              </span>
            </div>
            {caretaker.specializations.slice(0, 2).map((spec) => (
              <span
                key={spec}
                className="px-2 py-1 bg-lavender-200 text-lavender-400 rounded-full text-xs font-medium"
              >
                {spec}
              </span>
            ))}
            {caretaker.specializations.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                +{caretaker.specializations.length - 2} more
              </span>
            )}
          </div>

          {/* Languages */}
          <div className="flex items-center gap-2 text-xs text-purple-700 mb-3">
            <Languages className="w-3 h-3" />
            <span>{caretaker.languages.join(', ')}</span>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {caretaker.available_for_overnight && (
              <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                Overnight available
              </span>
            )}
            {caretaker.available_for_live_in && (
              <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
                Live-in available
              </span>
            )}
            {caretaker.certifications && caretaker.certifications.length > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                <Award className="w-3 h-3" />
                Certified
              </span>
            )}
          </div>

          {/* Select Button */}
          {showSelectButton && onSelect && (
            <button
              onClick={onSelect}
              className="mt-4 w-full bg-purple-800 text-white py-2 px-4 rounded-lg hover:bg-purple-900 transition-colors text-sm font-semibold"
            >
              Select {caretaker.full_name}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}