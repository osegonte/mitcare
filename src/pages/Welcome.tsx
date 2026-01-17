import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart } from 'lucide-react';

export default function Welcome() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      // User already logged in, redirect to their dashboard
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex flex-col">
      {/* Header */}
      <header className="pt-8 pb-4 px-4 sm:px-6">
        <div className="max-w-md mx-auto flex items-center justify-center gap-2">
          <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">MitCare</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 pb-16">
        <div className="max-w-md w-full">
          {/* Headline */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Care made simple
            </h2>
            <p className="text-lg text-gray-600">
              Transparent, multilingual care coordination for families in Germany
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="space-y-4">
            {/* Client Button */}
            <button
              onClick={() => handleRoleSelect('client')}
              className="w-full bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] group"
            >
              <div className="flex items-center justify-between">
                <div className="text-left flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                    I need care
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Find verified care agencies quickly
                  </p>
                </div>
                <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                  <svg
                    className="w-6 h-6 text-teal-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </button>

            {/* Provider Button */}
            <button
              onClick={() => handleRoleSelect('provider')}
              className="w-full bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] group"
            >
              <div className="flex items-center justify-between">
                <div className="text-left flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                    I provide care
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Connect with families seeking care
                  </p>
                </div>
                <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                  <svg
                    className="w-6 h-6 text-teal-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </button>
          </div>

          {/* Tagline */}
          <p className="text-center text-sm text-gray-500 mt-8">
            Care coordination for modern families
          </p>
        </div>
      </main>
    </div>
  );
}