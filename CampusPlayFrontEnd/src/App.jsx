import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import AuthPage from './pages/AuthPage';
import StudentBookingPage from './pages/StudentBookingPage';
import StudentHistoryPage from './pages/StudentHistoryPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {user && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Navigate
                  to={user.role === 'STUDENT' ? '/book' : '/admin'}
                  replace
                />
              ) : (
                <AuthPage />
              )
            }
          />
          <Route
            path="/book"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentBookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner"
            element={<OwnerDashboardPage />}
          />
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
