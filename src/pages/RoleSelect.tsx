import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Shield } from 'lucide-react';

export default function RoleSelect() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const role = location.state?.role as 'client' | 'provider';

  if (!role) {
    navigate('/', { replace: true });
    return null;
  }

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle(role);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  const roleText = {
    client: {
      title: 'Find Care',
      subtitle: 'Sign in to find verified care agencies',
      description: 'Access our network of trusted care providers',
    },
    provider: {
      title: 'Provide Care',
      subtitle: 'Sign in to connect with families',
      description: 'Manage bookings and grow your care business',
    },
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with Logo */}
      <header className="bg-white border-b border-gray-200 py-6 px-4 sm:px-6">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-purple-700 hover:text-purple-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <div className="flex items-center justify-center gap-3">
            <img src="/logo.png" alt="MitCare" className="w-12 h-12" />
            <h1 className="text-3xl font-bold text-purple-900">MitCare</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="max-w-md w-full">
          {/* Role Title Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-purple-900 mb-2">
              {roleText[role].title}
            </h2>
            <p className="text-lg text-purple-700 mb-1">{roleText[role].subtitle}</p>
            <p className="text-sm text-purple-500">{roleText[role].description}</p>
          </div>

          {/* Clear Section Divider */}
          <div className="mb-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-purple-700 font-semibold">
                  Secure Login
                </span>
              </div>
            </div>
          </div>

          {/* Sign In Card with Clear Border */}
          <div className="bg-white border-2 border-gray-300 rounded-2xl p-8 shadow-sm">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white border-2 border-purple-800 rounded-xl p-4 hover:bg-purple-50 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-800"></div>
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="font-semibold text-purple-900 text-lg">
                    Continue with Google
                  </span>
                </>
              )}
            </button>

            {/* Security Badge */}
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-purple-500">
              <Shield className="w-4 h-4" />
              <span>Secure authentication via Google</span>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <p className="text-xs text-center text-purple-700">
              By continuing, you agree to MitCare's{' '}
              <span className="font-semibold">Terms of Service</span> and{' '}
              <span className="font-semibold">Privacy Policy</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}