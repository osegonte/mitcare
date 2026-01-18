// src/pages/provider/ProviderDashboard.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Heart, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { Booking } from '../../types';

type BookingWithClient = Booking & {
  client: {
    full_name: string;
    email: string;
  };
};

export default function ProviderDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<any>(null);
  const [bookings, setBookings] = useState<BookingWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    accepted: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // OPTIMIZED: Single query to get provider
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (providerError || !providerData) {
        setLoading(false);
        return;
      }

      setProvider(providerData);

      // OPTIMIZED: Get bookings in one query
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          client:profiles!bookings_client_id_fkey(full_name, email)
        `)
        .eq('provider_id', providerData.id)
        .order('created_at', { ascending: false })
        .limit(50); // Limit to recent 50 bookings

      if (!bookingsError && bookingsData) {
        const bookingsWithClient = bookingsData.map(booking => ({
          ...booking,
          client: booking.client,
        }));

        setBookings(bookingsWithClient);

        // Calculate stats
        const pending = bookingsWithClient.filter(b => b.status === 'pending').length;
        const accepted = bookingsWithClient.filter(b => b.status === 'accepted').length;
        const completed = bookingsWithClient.filter(b => b.status === 'completed').length;

        setStats({ pending, accepted, completed });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: Booking['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-green-100 text-green-700',
      declined: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700',
      completed: 'bg-blue-100 text-blue-700',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // If no provider profile exists, show onboarding message
  if (!loading && !provider) {
    return (
      <div className="min-h-screen bg-gradient-to-br bg-lavender-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-800 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" fill="currentColor" />
              </div>
              <h1 className="text-xl font-bold text-purple-900">MitCare Provider</h1>
            </div>
            <button onClick={signOut} className="text-sm text-purple-700 hover:text-purple-900">
              Sign Out
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
            <div className="w-16 h-16 bg-lavender-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-lavender-400" />
            </div>
            <h2 className="text-2xl font-bold text-purple-900 mb-3">
              Complete Your Provider Profile
            </h2>
            <p className="text-purple-700 mb-6">
              To start receiving booking requests, you need to set up your agency profile first.
            </p>
            <button
              onClick={() => navigate('/provider/onboarding')}
              className="bg-purple-800 text-white px-8 py-3 rounded-lg hover:bg-purple-900 transition-colors"
            >
              Set Up Profile
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br bg-lavender-50">
        <div className="bg-white shadow-sm animate-pulse">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
          <div className="h-24 bg-white rounded-xl"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-white rounded-xl"></div>
            <div className="h-24 bg-white rounded-xl"></div>
            <div className="h-24 bg-white rounded-xl"></div>
          </div>
          <div className="h-32 bg-white rounded-xl"></div>
        </div>
      </div>
    );
  }

  const pendingBookings = bookings.filter(b => b.status === 'pending').slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br bg-lavender-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-800 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-purple-900">MitCare Provider</h1>
              <p className="text-xs text-purple-700">{provider?.agency_name}</p>
            </div>
          </div>
          <button onClick={signOut} className="text-sm text-purple-700 hover:text-purple-900">
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-purple-900 mb-2">
            Welcome back, {user?.full_name?.split(' ')[0] || 'there'}!
          </h2>
          <p className="text-purple-700">Manage your bookings and grow your business.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-900">{stats.pending}</p>
                <p className="text-sm text-purple-700">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-900">{stats.accepted}</p>
                <p className="text-sm text-purple-700">Accepted</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-900">{stats.completed}</p>
                <p className="text-sm text-purple-700">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => navigate('/provider/bookings')}
            className="bg-purple-800 text-white rounded-xl p-6 shadow-lg hover:bg-purple-900 transition-all text-left"
          >
            <Calendar className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-semibold mb-1">All Bookings</h3>
            <p className="text-purple-200 text-sm">View and manage all requests</p>
          </button>

          <button
            onClick={() => navigate('/provider/profile')}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all text-left"
          >
            <CheckCircle className="w-8 h-8 text-lavender-400 mb-3" />
            <h3 className="text-lg font-semibold text-purple-900 mb-1">My Profile</h3>
            <p className="text-purple-700 text-sm">Update your information</p>
          </button>
        </div>

        {/* Recent Pending Requests */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-900">
              Pending Requests ({stats.pending})
            </h3>
            {stats.pending > 5 && (
              <button
                onClick={() => navigate('/provider/bookings')}
                className="text-sm text-lavender-400 hover:text-lavender-400"
              >
                View All
              </button>
            )}
          </div>

          {pendingBookings.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-purple-700">No pending requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingBookings.map((booking) => (
                <div
                  key={booking.id}
                  onClick={() => navigate('/provider/bookings')}
                  className="p-4 border-2 border-gray-200 rounded-xl hover:border-lavender-300 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-purple-900">{booking.client.full_name}</p>
                      <p className="text-sm text-purple-700">{booking.service_type}</p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-purple-700">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDateTime(booking.date_time)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}