import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/useAuthStore';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { Account } from './pages/Account';
import { PendingApprovalPage } from './pages/PendingApprovalPage';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

function App() {
  const { user, token, setLoading, isLoading } = useAuthStore();

  useEffect(() => {
    // Initialize auth state
    const storedToken = localStorage.getItem('token');
    if (storedToken && !token) {
      // You might want to validate the token with the backend here
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [token, setLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Not authenticated
  if (!user || !token) {
    return (
      <>
        <AuthPage />
        <Toaster position="top-right" />
      </>
    );
  }

  // User pending approval
  if (user.approval_status === 'pending') {
    return (
      <>
        <PendingApprovalPage />
        <Toaster position="top-right" />
      </>
    );
  }

  // User rejected
  if (user.approval_status === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-red-700">
            Your account has been rejected by the administrator.
          </p>
        </div>
        <Toaster position="top-right" />
      </div>
    );
  }

  // Approved user
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/account" element={<Account />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;