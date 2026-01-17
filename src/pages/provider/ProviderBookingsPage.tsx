import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Calendar, MapPin, Clock, CheckCircle, XCircle, User, FileText } from 'lucide-react';
import type { Booking } from '../../types';

type BookingWithClient = Booking & {
  client: {
    full_name: string;
    email: string;
  };
};

export default function ProviderBookingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'all'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // First get provider ID
      const { data: providerData } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!providerData) {
        setLoading(false);
        return;
      }

      // Then get bookings
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          client:profiles!bookings_client_id_fkey(full_name, email)
        `)
        .eq('provider_id', providerData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const bookingsWithClient = data.map(booking => ({
        ...booking,
        client: booking.client,
      }));

      setBookings(bookingsWithClient);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBooking = async (bookingId: string) => {
    if (!confirm('Accept this booking request?')) return;

    try {
      setProcessingId(bookingId);
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', bookingId);

      if (error) throw error;

      // Refresh bookings
      fetchBookings();
      alert('Booking accepted! The client will be notified.');
    } catch (error) {
      console.error('Error accepting booking:', error);
      alert('Failed to accept booking. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeclineBooking = async (bookingId: string) => {
    if (!confirm('Decline this booking request? This cannot be undone.')) return;

    try {
      setProcessingId(bookingId);
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'declined', updated_at: new Date().toISOString() })
        .eq('id', bookingId);

      if (error) throw error;

      // Refresh bookings
      fetchBookings();
      alert('Booking declined.');
    } catch (error) {
      console.error('Error declining booking:', error);
      alert('Failed to decline booking. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkCompleted = async (bookingId: string) => {
    if (!confirm('Mark this booking as completed?')) return;

    try {
      setProcessingId(bookingId);
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', bookingId);

      if (error) throw error;

      // Refresh bookings
      fetchBookings();
      alert('Booking marked as completed!');
    } catch (error) {
      console.error('Error marking booking as completed:', error);
      alert('Failed to update booking. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: Booking['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-green-100 text-green-700',
      declined: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700',
      completed: 'bg-blue-100 text-blue-700',
    };

    const icons = {
      pending: <Clock className="w-4 h-4" />,
      accepted: <CheckCircle className="w-4 h-4" />,
      declined: <XCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />,
      completed: <CheckCircle className="w-4 h-4" />,
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('en-GB', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const filterBookings = (bookings: BookingWithClient[]) => {
    if (activeTab === 'pending') {
      return bookings.filter(b => b.status === 'pending');
    } else if (activeTab === 'accepted') {
      return bookings.filter(b => b.status === 'accepted');
    }
    return bookings;
  };

  const filteredBookings = filterBookings(bookings);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
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
            onClick={() => navigate('/provider/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Booking Requests</h1>
          <p className="text-sm text-gray-600">{bookings.length} total bookings</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-2xl p-2 shadow-lg mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
              activeTab === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Pending ({bookings.filter(b => b.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('accepted')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
              activeTab === 'accepted'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Accepted ({bookings.filter(b => b.status === 'accepted').length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-teal-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            All ({bookings.length})
          </button>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No {activeTab} bookings
            </h3>
            <p className="text-gray-600">
              {activeTab === 'pending'
                ? 'No pending requests at the moment.'
                : activeTab === 'accepted'
                ? 'No accepted bookings yet.'
                : 'No bookings found.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const { date, time } = formatDateTime(booking.date_time);
              const isPending = booking.status === 'pending';
              const isAccepted = booking.status === 'accepted';
              const isProcessing = processingId === booking.id;

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-5 h-5 text-gray-400" />
                        <h3 className="text-xl font-bold text-gray-900">
                          {booking.client.full_name}
                        </h3>
                      </div>
                      <p className="text-gray-600">{booking.service_type}</p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-teal-600" />
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="font-semibold text-gray-900">{date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-teal-600" />
                      <div>
                        <p className="text-xs text-gray-500">Time</p>
                        <p className="font-semibold text-gray-900">{time}</p>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Service Address</p>
                      <p className="text-gray-900">{booking.address}</p>
                    </div>
                  </div>

                  {/* Notes */}
                  {booking.notes && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
                      <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Client Notes</p>
                        <p className="text-sm text-gray-900">{booking.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Contact */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Contact</p>
                    <p className="text-sm text-gray-900">{booking.client.email}</p>
                  </div>

                  {/* Actions */}
                  {isPending && (
                    <div className="pt-4 border-t border-gray-100 flex gap-3">
                      <button
                        onClick={() => handleAcceptBooking(booking.id)}
                        disabled={isProcessing}
                        className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        {isProcessing ? 'Processing...' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleDeclineBooking(booking.id)}
                        disabled={isProcessing}
                        className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        {isProcessing ? 'Processing...' : 'Decline'}
                      </button>
                    </div>
                  )}

                  {isAccepted && (
                    <div className="pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleMarkCompleted(booking.id)}
                        disabled={isProcessing}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        {isProcessing ? 'Processing...' : 'Mark as Completed'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}