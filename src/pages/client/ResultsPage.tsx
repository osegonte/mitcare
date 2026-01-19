import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, MapPin, Star, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import type { Provider } from '../../types';
import { cache, CACHE_KEYS } from '../../utils/cache';
import { LoadingSkeleton } from '../../components/shared/LoadingSkeleton';

export default function ResultsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviders();
  }, [searchParams]);

  const fetchProviders = async () => {
    try {
      const location = searchParams.get('location') || '';
      const servicesParam = searchParams.get('services') || '';
      const services = servicesParam ? servicesParam.split(',') : [];

      // Check cache first
      const cacheKey = CACHE_KEYS.providerSearch(location, servicesParam);
      const cachedData = cache.get<Provider[]>(cacheKey);

      if (cachedData) {
        setProviders(cachedData);
        setLoading(false);
        return;
      }

      // Cache miss - fetch from database
      setLoading(true);
      let query = supabase.from('providers').select('*');

      if (location) {
        query = query.contains('service_areas', [location]);
      }

      if (services.length > 0) {
        query = query.overlaps('services_offered', services);
      }

      const { data, error } = await query;

      if (error) throw error;

      const results = data || [];
      setProviders(results);

      // Cache the results for 5 minutes
      cache.set(cacheKey, results, 5);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriceRange = (provider: Provider) => {
    const ranges = Object.values(provider.price_ranges || {});
    if (ranges.length === 0) return 'Contact for pricing';
    
    const allPrices = ranges.flatMap(r => [r.min, r.max]);
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    
    return `€${min}–${max}/hr`;
  };

  const location = searchParams.get('location');

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br bg-lavender-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/client/search')}
            className="flex items-center gap-2 text-purple-700 hover:text-purple-900 mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Search</span>
          </button>
          <h1 className="text-2xl font-bold text-purple-900">
            {location || 'All'} Care Agencies
          </h1>
          <p className="text-sm text-purple-700">
            {providers.length} {providers.length === 1 ? 'agency' : 'agencies'} found
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {providers.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-purple-900 mb-2">
              No agencies found
            </h3>
            <p className="text-purple-700 mb-6">
              Try adjusting your search filters or location.
            </p>
            <button
              onClick={() => navigate('/client/search')}
              className="bg-purple-800 text-white px-6 py-3 rounded-lg hover:bg-purple-900 transition-colors"
            >
              Back to Search
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {providers.map((provider) => (
              <div
                key={provider.id}
                onClick={() => navigate(`/client/provider/${provider.id}`)}
                className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-6 hover:border-purple-800 hover:shadow-xl transition-all cursor-pointer active:scale-[0.99]"
              >
                {/* Provider Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-lg sm:text-xl font-bold text-purple-900 truncate">
                        {provider.agency_name}
                      </h3>
                      {provider.verification_status === 'verified' && (
                        <CheckCircle className="w-5 h-5 text-lavender-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-purple-700 text-sm mb-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{provider.location}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-base sm:text-lg font-bold text-purple-800 whitespace-nowrap">
                      {getPriceRange(provider)}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-purple-500 justify-end mt-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                      <span className="font-semibold">4.{Math.floor(Math.random() * 5) + 5}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-purple-700 mb-4 line-clamp-2 leading-relaxed">
                  {provider.description}
                </p>

                {/* Services Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {provider.services_offered.slice(0, 3).map((service, idx) => (
                    <span
                      key={`${provider.id}-service-${idx}`}
                      className="px-3 py-1.5 bg-lavender-200 text-lavender-400 rounded-full text-xs font-medium"
                    >
                      {service}
                    </span>
                  ))}
                  {provider.services_offered.length > 3 && (
                    <span className="px-3 py-1.5 bg-gray-100 text-purple-700 rounded-full text-xs font-medium">
                      +{provider.services_offered.length - 3} more
                    </span>
                  )}
                </div>

                {/* Languages */}
                <div className="flex items-center gap-2 text-sm text-purple-700 mb-4">
                  <span className="font-medium">Languages:</span>
                  <span className="truncate">{provider.languages.join(', ')}</span>
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm text-purple-500 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">{provider.response_time}</span>
                    </div>
                    <div className="whitespace-nowrap">
                      {provider.completed_bookings} {provider.completed_bookings === 1 ? 'booking' : 'bookings'}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-purple-700 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}