import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight } from 'lucide-react';

export default function Welcome() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      const destination = user.role === 'client' ? '/client/home' : '/provider/dashboard';
      navigate(destination, { replace: true });
    }
  }, [user, loading, navigate]);

  const handleRoleSelect = (role: 'client' | 'provider') => {
    localStorage.setItem('pending_role', role);
    navigate('/auth/role-select', { state: { role } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-800"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with Logo */}
      <header className="bg-white border-b border-gray-200 py-6 px-4 sm:px-6">
        <div className="max-w-md mx-auto flex items-center justify-center gap-3">
          <img src="/logo.png" alt="MitCare" className="w-12 h-12" />
          <h1 className="text-3xl font-bold text-purple-900">MitCare</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="max-w-md w-full">
          {/* Welcome Section */}
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-purple-900 mb-4">
              Welcome to MitCare
            </h2>
            <p className="text-lg text-purple-700">
              Transparent, multilingual care coordination for families in Germany
            </p>
          </div>

          {/* Clear Section Divider */}
          <div className="mb-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-purple-700 font-semibold">
                  Choose your account type
                </span>
              </div>
            </div>
          </div>

          {/* Role Selection Cards - Clear Borders */}
          <div className="space-y-4">
            {/* Client Button */}
            <button
              onClick={() => handleRoleSelect('client')}
              className="w-full bg-white border-2 border-purple-800 rounded-xl p-6 hover:bg-purple-50 transition-all duration-200 active:scale-[0.98] group"
            >
              <div className="flex items-center justify-between">
                <div className="text-left flex-1">
                  <h3 className="text-xl font-bold text-purple-900 mb-2">
                    I need care
                  </h3>
                  <p className="text-purple-700 text-sm">
                    Find verified care agencies in your area
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-800 rounded-full flex items-center justify-center group-hover:bg-purple-900 transition-colors">
                  <ArrowRight className="w-6 h-6 text-white" />
                </div>
              </div>
            </button>

            {/* Provider Button */}
            <button
              onClick={() => handleRoleSelect('provider')}
              className="w-full bg-white border-2 border-purple-800 rounded-xl p-6 hover:bg-purple-50 transition-all duration-200 active:scale-[0.98] group"
            >
              <div className="flex items-center justify-between">
                <div className="text-left flex-1">
                  <h3 className="text-xl font-bold text-purple-900 mb-2">
                    I provide care
                  </h3>
                  <p className="text-purple-700 text-sm">
                    Connect with families seeking care services
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-800 rounded-full flex items-center justify-center group-hover:bg-purple-900 transition-colors">
                  <ArrowRight className="w-6 h-6 text-white" />
                </div>
              </div>
            </button>
          </div>

          {/* Footer Info */}
          <div className="mt-10 text-center">
            <p className="text-sm text-purple-500">
              Professional care coordination made simple
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}