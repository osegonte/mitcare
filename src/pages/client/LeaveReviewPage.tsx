import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { ReviewForm } from '../../components/reviews/ReviewForm';
import type { Booking, Provider, Caretaker } from '../../types';

type BookingWithDetails = Booking & {
  provider: Provider;
  caretaker?: Caretaker;
};

export default function LeaveReviewPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasReview, setHasReview] = useState(false);

  useEffect(() => {
    fetchBookingAndCheckReview();
  }, [bookingId]);

  const fetchBookingAndCheckReview = async () => {
    if (!bookingId || !user) return;

    try {
      setLoading(true);

      // Fetch booking with provider and caretaker
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
          provider:providers(*),
          caretaker:caretakers(*)
        `)
        .eq('id', bookingId)
        .eq('client_id', user.id)
        .single();

      if (bookingError) throw bookingError;

      setBooking(bookingData as any);

      // Check if review already exists
      const { data: reviewData } = await supabase
        .from('reviews')
        .select('id')
        .eq('booking_id', bookingId)
        .single();

      if (reviewData) {
        setHasReview(true);
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!booking || !user) return;

    const { error } = await supabase.from('reviews').insert({
      booking_id: booking.id,
      client_id: user.id,
      provider_id: booking.provider_id,
      caretaker_id: booking.caretaker_id || null,
      rating,
      comment: comment || null,
    });

    if (error) throw error;

    // Success! Navigate to confirmation
    navigate('/client/review-success', { 
      state: { 
        providerName: booking.provider.agency_name,
        rating 
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br bg-lavender-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lavender-300"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br bg-lavender-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-purple-900 mb-2">Booking Not Found</h2>
          <button
            onClick={() => navigate('/client/appointments')}
            className="bg-purple-800 text-white px-6 py-3 rounded-lg hover:bg-purple-900 transition-colors mt-4"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  if (hasReview) {
    return (
      <div className="min-h-screen bg-gradient-to-br bg-lavender-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <button
              onClick={() => navigate('/client/appointments')}
              className="flex items-center gap-2 text-purple-700 hover:text-purple-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Appointments</span>
            </button>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-purple-900 mb-3">
              Review Already Submitted
            </h1>
            <p className="text-purple-700 mb-6">
              You've already left a review for this booking. Thank you for your feedback!
            </p>
            <button
              onClick={() => navigate('/client/appointments')}
              className="bg-purple-800 text-white px-6 py-3 rounded-lg hover:bg-purple-900 transition-colors"
            >
              Back to Appointments
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (booking.status !== 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br bg-lavender-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-purple-900 mb-2">Booking Not Completed</h2>
          <p className="text-purple-700 mb-6">
            You can only leave a review after the booking is completed.
          </p>
          <button
            onClick={() => navigate('/client/appointments')}
            className="bg-purple-800 text-white px-6 py-3 rounded-lg hover:bg-purple-900 transition-colors"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br bg-lavender-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/client/appointments')}
            className="flex items-center gap-2 text-purple-700 hover:text-purple-900 mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Appointments</span>
          </button>
          <h1 className="text-2xl font-bold text-purple-900">Leave a Review</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <ReviewForm
          onSubmit={handleSubmitReview}
          providerName={booking.provider.agency_name}
          caretakerName={booking.caretaker?.full_name}
        />
      </main>
    </div>
  );
}