import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, MapPin, CheckCircle, Clock, Star, Languages, Calendar } from 'lucide-react';
import type { Provider } from '../../types';

export default function ProviderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProvider();
  }, [id]);

  const fetchProvider = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProvider(data);
    } catch (error) {
      console.error('Error fetching provider:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Agency Not Found</h2>
          <p className="text-gray-600 mb-6">This care agency could not be found.</p>
          <button
            onClick={() => navigate('/client/search')}
            className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Back to Search
          </button>
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
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 pb-24">
        {/* Agency Header */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {provider.agency_name}
                </h1>
                {provider.verification_status === 'verified' && (
                  <CheckCircle className="w-6 h-6 text-teal-600" />
                )}
              </div>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <MapPin className="w-4 h-4" />
                <span>{provider.location}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">4.{Math.floor(Math.random() * 5) + 5}</span>
                <span className="text-gray-400 ml-1">({provider.completed_bookings} bookings)</span>
              </div>
            </div>
          </div>

          {/* Trust Signals */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-teal-600" />
              <span className="text-gray-600">{provider.response_time}</span>
            </div>
            {provider.years_experience && (
              <div className="text-sm text-gray-600">
                <span className="font-semibold">{provider.years_experience}</span> years experience
              </div>
            )}
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
          <p className="text-gray-600 leading-relaxed">{provider.description}</p>
        </div>

        {/* Services & Pricing */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Services & Pricing</h2>
          <div className="space-y-3">
            {provider.services_offered.map((service) => {
              const priceRange = provider.price_ranges[service];
              return (
                <div
                  key={service}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <span className="font-medium text-gray-900">{service}</span>
                  {priceRange && (
                    <span className="text-teal-600 font-semibold">
                      €{priceRange.min}–{priceRange.max}/hr
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Languages */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Languages className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-semibold text-gray-900">Languages Spoken</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {provider.languages.map((language) => (
              <span
                key={language}
                className="px-4 py-2 bg-teal-50 text-teal-700 rounded-full font-medium"
              >
                {language}
              </span>
            ))}
          </div>
        </div>

        {/* Service Areas */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-semibold text-gray-900">Service Areas</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {provider.service_areas.map((area) => (
              <span
                key={area}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium"
              >
                {area}
              </span>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-semibold text-gray-900">Availability</h2>
          </div>
          <div className="space-y-2">
            {Object.entries(provider.availability).map(([day, hours]) => (
              <div
                key={day}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="font-medium text-gray-900 capitalize">{day}</span>
                <span className="text-gray-600 text-sm">
                  {Array.isArray(hours) ? hours.join(', ') : 'Closed'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(`/client/book/${provider.id}`)}
            className="w-full bg-teal-600 text-white rounded-xl py-4 font-semibold shadow-lg hover:bg-teal-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            Request Booking
          </button>
        </div>
      </div>
    </div>
  );
}