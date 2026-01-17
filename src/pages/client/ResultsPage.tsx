import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, MapPin, Star, CheckCircle, Clock } from 'lucide-react';
import type { Provider } from '../../types';

export default function ResultsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        setDebugInfo('🔍 Starting fetch...');
        console.log('🔍 Starting fetch...');
        
        const location = searchParams.get('location');
        const servicesParam = searchParams.get('services');
        const services = servicesParam ? servicesParam.split(',') : [];

        console.log('📍 Location:', location);
        console.log('🏥 Services:', services);
        setDebugInfo(`📍 Location: ${location}\n🏥 Services: ${services.join(', ')}`);

        let query = supabase.from('providers').select('*');

        // Filter by location if specified
        if (location) {
          console.log('🔎 Filtering by location:', location);
          query = query.contains('service_areas', [location]);
        }

        // Filter by services if specified
        if (services.length > 0) {
          console.log('🔎 Filtering by services:', services);
          query = query.overlaps('services_offered', services);
        }

        console.log('🚀 Running query...');
        const { data, error } = await query;

        console.log('✅ Data received:', data);
        console.log('❌ Error (if any):', error);
        console.log('📊 Number of results:', data?.length || 0);

        if (error) {
          console.error('💥 Supabase error:', error);
          setDebugInfo(`💥 Error: ${error.message}`);
          throw error;
        }

        console.log('✨ Setting providers:', data?.length || 0, 'providers');
        setProviders(data || []);
        setDebugInfo(`✅ Found ${data?.length || 0} providers`);
      } catch (error: any) {
        console.error('💥 Catch block error:', error);
        setDebugInfo(`💥 Catch error: ${error.message || 'Unknown error'}`);
      } finally {
        console.log('🏁 Finally block - setting loading to false');
        setLoading(false);
      }
    };

    fetchProviders();
  }, [searchParams]);

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading providers...</p>
          {debugInfo && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow max-w-md mx-auto">
              <pre className="text-xs text-left whitespace-pre-wrap">{debugInfo}</pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/client/search')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Search</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {location || 'All'} Care Agencies
          </h1>
          <p className="text-sm text-gray-600">{providers.length} agencies found</p>
        </div>
      </header>

      {/* Debug Info */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-sm font-semibold mb-2">🐛 Debug Info:</p>
          <pre className="text-xs whitespace-pre-wrap">{debugInfo}</pre>
          <p className="text-xs mt-2">Check browser console (F12) for detailed logs</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {providers.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No agencies found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search filters or location.
            </p>
            <button
              onClick={() => navigate('/client/search')}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
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
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-[0.99]"
              >
                {/* Provider Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {provider.agency_name}
                      </h3>
                      {provider.verification_status === 'verified' && (
                        <CheckCircle className="w-5 h-5 text-teal-600" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{provider.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-teal-600">
                      {getPriceRange(provider)}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>4.{Math.floor(Math.random() * 5) + 5}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {provider.description}
                </p>

                {/* Services Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {provider.services_offered.slice(0, 3).map((service, idx) => (
                    <span
                      key={`${provider.id}-service-${idx}`}
                      className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium"
                    >
                      {service}
                    </span>
                  ))}
                  {provider.services_offered.length > 3 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                      +{provider.services_offered.length - 3} more
                    </span>
                  )}
                </div>

                {/* Languages */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <span className="font-medium">Languages:</span>
                  <span>{provider.languages.join(', ')}</span>
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{provider.response_time}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {provider.completed_bookings} bookings completed
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}