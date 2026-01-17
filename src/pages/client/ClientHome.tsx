import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Heart, Search, Calendar, MessageSquare, Bookmark } from 'lucide-react';

export default function ClientHome() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [bookingCount, setBookingCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);

  useEffect(() => {
    const fetchBookingCount = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('id', { count: 'exact' })
          .eq('client_id', user.id)
          .in('status', ['pending', 'accepted']);
        
        if (error) throw error;
        setBookingCount(data?.length || 0);
      } catch (error) {
        console.error('Error fetching booking count:', error);
      } finally {
        setLoadingCount(false);
      }
    };
    
    fetchBookingCount();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">MitCare</h1>
          </div>
          <button
            onClick={signOut}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.full_name?.split(' ')[0] || 'there'}!
          </h2>
          <p className="text-gray-600">Find the care you need, when you need it.</p>
        </div>

        {/* Primary CTA */}
        <button
          onClick={() => navigate('/client/search')}
          className="w-full bg-teal-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl hover:bg-teal-700 transition-all duration-200 active:scale-[0.98] mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="text-left flex-1">
              <h3 className="text-xl font-semibold mb-2">Book Care Now</h3>
              <p className="text-teal-100 text-sm">
                Search verified agencies in your area
              </p>
            </div>
            <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
          </div>
        </button>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => navigate('/client/appointments')}
            className="bg-white rounded-xl p-5 shadow hover:shadow-md transition-all text-left"
          >
            <Calendar className="w-8 h-8 text-teal-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Appointments</h3>
            <p className="text-sm text-gray-500">
              {loadingCount ? (
                'Loading...'
              ) : bookingCount > 0 ? (
                `${bookingCount} upcoming`
              ) : (
                'No upcoming bookings'
              )}
            </p>
          </button>

          <button className="bg-white rounded-xl p-5 shadow hover:shadow-md transition-all text-left">
            <Bookmark className="w-8 h-8 text-teal-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Saved</h3>
            <p className="text-sm text-gray-500">0 providers</p>
          </button>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-2xl p-8 text-center shadow">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Ready to get started?
          </h3>
          <p className="text-gray-600 mb-4">
            Book your first care service and we'll guide you through the process.
          </p>
          <button
            onClick={() => navigate('/client/search')}
            className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Search className="w-5 h-5" />
            Find Care
          </button>
        </div>
      </main>
    </div>
  );
}