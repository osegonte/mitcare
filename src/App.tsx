// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import Welcome from './pages/Welcome';
import AuthCallback from './pages/AuthCallback';
import RoleSelect from './pages/RoleSelect';
import ClientHome from './pages/client/ClientHome';
import SearchPage from './pages/client/SearchPage';
import ResultsPage from './pages/client/ResultsPage';
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ProtectedRoute from './components/shared/ProtectedRoute';
import ProviderDetailPage from './pages/client/ProviderDetailPage';
import BookingPage from './pages/client/BookingPage';
import BookingConfirmationPage from './pages/client/BookingConfirmationPage';
import AppointmentsPage from './pages/client/AppointmentsPage';
import ProviderBookingsPage from './pages/provider/ProviderBookingsPage';
import ProviderOnboarding from './pages/provider/ProviderOnboarding';

function App() {
  return (
    <ErrorBoundary>
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
            
            <Route
              path="/client/search"
              element={
                <ProtectedRoute role="client">
                  <SearchPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/client/results"
              element={
                <ProtectedRoute role="client">
                  <ResultsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/client/provider/:id"
              element={
                <ProtectedRoute role="client">
                  <ProviderDetailPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/client/book/:id"
              element={
                <ProtectedRoute role="client">
                  <BookingPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/client/booking-confirmation"
              element={
                <ProtectedRoute role="client">
                  <BookingConfirmationPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/client/appointments"
              element={
                <ProtectedRoute role="client">
                  <AppointmentsPage />
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

            <Route
              path="/provider/bookings"
              element={
                <ProtectedRoute role="provider">
                  <ProviderBookingsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/provider/onboarding"
              element={
                <ProtectedRoute role="provider">
                  <ProviderOnboarding />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;