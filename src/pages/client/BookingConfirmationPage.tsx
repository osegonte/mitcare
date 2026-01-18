import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Calendar, Home, Search } from 'lucide-react';

export default function BookingConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { providerName?: string; service?: string; dateTime?: string } | null;

  useEffect(() => {
    // If no state (direct navigation), redirect home
    if (!state) {
      navigate('/client/home', { replace: true });
    }
  }, [state, navigate]);

  if (!state) return null;

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br bg-lavender-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Success Icon */}
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center mb-6">
          <div className="w-20 h-20 bg-lavender-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-lavender-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-purple-900 mb-3">
            Booking Request Sent!
          </h1>
          
          <p className="text-purple-700 mb-6">
            Your booking request has been sent to <strong>{state.providerName}</strong>. 
            They will review your request and contact you shortly.
          </p>

          {/* Booking Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-semibold text-purple-900 mb-3">Booking Details</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-purple-500">Service:</span>
                <span className="ml-2 font-medium text-purple-900">{state.service}</span>
              </div>
              <div>
                <span className="text-purple-500">Date & Time:</span>
                <span className="ml-2 font-medium text-purple-900">
                  {formatDateTime(state.dateTime || '')}
                </span>
              </div>
              <div>
                <span className="text-purple-500">Status:</span>
                <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                  Pending
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-purple-500 mb-6">
            You can view and manage your bookings in your appointments page.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/client/appointments')}
            className="w-full bg-lavender-50 text-white rounded-xl py-4 font-semibold shadow-lg hover:bg-lavender-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            View My Appointments
          </button>

          <button
            onClick={() => navigate('/client/search')}
            className="w-full bg-white text-gray-700 rounded-xl py-4 font-semibold shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Book Another Service
          </button>

          <button
            onClick={() => navigate('/client/home')}
            className="w-full bg-white text-gray-700 rounded-xl py-4 font-semibold shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}