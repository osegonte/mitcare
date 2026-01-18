// src/pages/client/BookingPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Calendar, MapPin, FileText, AlertCircle, User } from 'lucide-react';
import type { Provider, Caretaker } from '../../types';

export default function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [caretakers, setCaretakers] = useState<Caretaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [selectedService, setSelectedService] = useState('');
  const [selectedCaretakerId, setSelectedCaretakerId] = useState<string>('');
  const [dateTime, setDateTime] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchProviderData();
  }, [id]);

  const fetchProviderData = async () => {
    try {
      setLoading(true);
      
      // Fetch provider
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('*')
        .eq('id', id)
        .single();

      if (providerError) throw providerError;
      setProvider(providerData);

      // Auto-select first service
      if (providerData.services_offered.length > 0) {
        setSelectedService(providerData.services_offered[0]);
      }

      // Fetch caretakers
      const { data: caretakersData, error: caretakersError } = await supabase
        .from('caretakers')
        .select('*')
        .eq('provider_id', id)
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (!caretakersError && caretakersData) {
        setCaretakers(caretakersData);
        
        // Check if caretaker was pre-selected from URL
        const preSelectedCaretakerId = searchParams.get('caretaker');
        if (preSelectedCaretakerId && caretakersData.find(c => c.id === preSelectedCaretakerId)) {
          setSelectedCaretakerId(preSelectedCaretakerId);
        }
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

      const bookingData: any = {
        client_id: user.id,
        provider_id: provider.id,
        service_type: selectedService,
        date_time: dateTime,
        address: address,
        notes: notes || null,
        status: 'pending',
      };

      // Add caretaker_id if specific caretaker selected
      if (selectedCaretakerId) {
        bookingData.caretaker_id = selectedCaretakerId;
      }

      const { error: bookingError } = await supabase.from('bookings').insert(bookingData);

      if (bookingError) throw bookingError;

      // Get selected caretaker name for confirmation
      const selectedCaretaker = caretakers.find(c => c.id === selectedCaretakerId);

      // Success! Navigate to confirmation
      navigate('/client/booking-confirmation', { 
        state: { 
          providerName: provider.agency_name,
          caretakerName: selectedCaretaker?.full_name,
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

  const selectedCaretaker = caretakers.find(c => c.id === selectedCaretakerId);

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

          {/* Caretaker Selection */}
          {caretakers.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <label className="block mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-lavender-400" />
                  <span className="font-semibold text-purple-900">Select Caretaker</span>
                  <span className="text-sm text-purple-500">(Optional)</span>
                </div>
                <p className="text-sm text-purple-700 mb-3">
                  Choose a specific caretaker or leave blank to let the agency assign one.
                </p>
                <select
                  value={selectedCaretakerId}
                  onChange={(e) => setSelectedCaretakerId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-lavender-300 focus:outline-none"
                >
                  <option value="">No preference (Agency will assign)</option>
                  {caretakers.map((caretaker) => (
                    <option key={caretaker.id} value={caretaker.id}>
                      {caretaker.full_name} - €{caretaker.hourly_rate_min}–{caretaker.hourly_rate_max}/hr
                      {caretaker.verified ? ' ✓ Verified' : ''}
                    </option>
                  ))}
                </select>
              </label>

              {/* Selected Caretaker Preview */}
              {selectedCaretaker && (
                <div className="mt-4 p-4 bg-lavender-50 border border-lavender-300 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-lavender-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-lavender-400">
                        {selectedCaretaker.full_name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-purple-900">{selectedCaretaker.full_name}</p>
                      <p className="text-sm text-purple-700">
                        {selectedCaretaker.years_experience} years experience
                      </p>
                      <p className="text-xs text-purple-500">
                        {selectedCaretaker.specializations.slice(0, 2).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
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

          {/* Submit Button */}
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