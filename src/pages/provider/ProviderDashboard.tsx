import { useAuth } from '../../contexts/AuthContext';

export default function ProviderDashboard() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Provider Dashboard</h1>
        <p className="mb-4">Welcome, {user?.full_name || user?.email}!</p>
        <button
          onClick={signOut}
          className="bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}