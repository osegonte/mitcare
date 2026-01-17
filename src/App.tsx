import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Welcome from './pages/Welcome';
import AuthCallback from './pages/AuthCallback';
import RoleSelect from './pages/RoleSelect';
import ClientHome from './pages/client/ClientHome';
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ProtectedRoute from './components/shared/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Welcome />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/role-select" element={<RoleSelect />} />

          {/* Protected client routes */}
          <Route
            path="/client/home"
            element={
              <ProtectedRoute role="client">
                <ClientHome />
              </ProtectedRoute>
            }
          />

          {/* Protected provider routes */}
          <Route
            path="/provider/dashboard"
            element={
              <ProtectedRoute role="provider">
                <ProviderDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;