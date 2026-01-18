// src/pages/client/BookingPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Calendar, MapPin, FileText, AlertCircle } from 'lucide-react';
import type { Provider } from '../../types';

export default function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [selectedService, setSelectedService] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

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
      // Auto-select first service
      if (data.services_offered.length > 0) {
        setSelectedService(data.services_offered[0]);
      }
    } catch (error) {
      console.error('Error fetching provider:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !provider) return;

    // Validation
    if (!selectedService || !dateTime || !address) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const { error: bookingError } = await supabase.from('bookings').insert({
        client_id: user.id,
        provider_id: provider.id,
        service_type: selectedService,
        date_time: dateTime,
        address: address,
        notes: notes || null,
        status: 'pending',
      });

      if (bookingError) throw bookingError;

      // Success! Navigate to confirmation
      navigate('/client/booking-confirmation', { 
        state: { 
          providerName: provider.agency_name,
          service: selectedService,
          dateTime: dateTime
        } 
      });
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.message || 'Failed to submit booking request');
      setSubmitting(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br bg-lavender-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lavender-300"></div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gradient-to-br bg-lavender-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-purple-900 mb-2">Agency Not Found</h2>
          <button
            onClick={() => navigate('/client/search')}
            className="bg-purple-800 text-white px-6 py-3 rounded-lg hover:bg-purple-900 transition-colors mt-4"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br bg-lavender-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-purple-700 hover:text-purple-900 mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-purple-900">Request Booking</h1>
          <p className="text-sm text-purple-700">{provider.agency_name}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Service Selection */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <label className="block mb-3">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-lavender-400" />
                <span className="font-semibold text-purple-900">Service Type *</span>
              </div>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-lavender-300 focus:outline-none"
              >
                {provider.services_offered.map((service) => {
                  const priceRange = provider.price_ranges[service];
                  return (
                    <option key={service} value={service}>
                      {service}
                      {priceRange && ` (€${priceRange.min}–${priceRange.max}/hr)`}
                    </option>
                  );
                })}
              </select>
            </label>
          </div>

          {/* Date & Time */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <label className="block mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-lavender-400" />
                <span className="font-semibold text-purple-900">Date & Time *</span>
              </div>
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                min={getMinDate()}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-lavender-300 focus:outline-none"
              />
            </label>
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <label className="block mb-3">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-lavender-400" />
                <span className="font-semibold text-purple-900">Service Address *</span>
              </div>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                rows={3}
                placeholder="Enter the full address where care is needed"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-lavender-300 focus:outline-none resize-none"
              />
            </label>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <label className="block mb-3">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-lavender-400" />
                <span className="font-semibold text-purple-900">Additional Notes</span>
                <span className="text-sm text-purple-500">(Optional)</span>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Any special requirements or information the agency should know..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-lavender-300 focus:outline-none resize-none"
              />
            </label>
          </div>

          {/* Payment Info */}
          <div className="bg-lavender-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>Payment:</strong> Payment will be handled directly with the agency. 
              They will contact you to confirm details and discuss payment options.
            </p>
          </div>

          {/* Submit Button - FIXED */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-purple-800 text-white rounded-xl py-4 font-semibold shadow-lg hover:bg-purple-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5" />
                Submit Booking Request
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}