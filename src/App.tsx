import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/useAuthStore';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { Account } from './pages/Account';
import { PendingApprovalPage } from './pages/PendingApprovalPage';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { LLMChat } from './components/llm/LLMChat';
import { AuthSuccess } from './components/auth/AuthSuccess';

function App() {
  const { user, token, setLoading, isLoading, fetchUserProfile } = useAuthStore();

  useEffect(() => {
    // Initialize auth state
    const storedToken = localStorage.getItem('token');
    if (storedToken && !token) {
      // Validate the token with the backend
      fetchUserProfile().catch(() => {
        // Token is invalid, clear it
        localStorage.removeItem('token');
      }).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [token, setLoading, fetchUserProfile]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* OAuth callback route - always accessible */}
        <Route path="/auth-success" element={<AuthSuccess />} />

        {/* Protected routes */}
        {user && token ? (
          <>
            {user.approval_status === 'pending' ? (
              <Route path="*" element={<PendingApprovalPage />} />
            ) : user.approval_status === 'rejected' ? (
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center bg-red-50">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">
                      Access Denied
                    </h1>
                    <p className="text-red-700">
                      Your account has been rejected by the administrator.
                    </p>
                  </div>
                </div>
              } />
            ) : (
              <>
                <Route path="/" element={<Dashboard />} />
                <Route path="/account" element={<Account />} />
                <Route path="/llm-chat" element={
                  <LLMChat
                    currentUser={{
                      _id: user._id,
                      name: user.name || 'User',
                      email: user.email,
                    }}
                    onBack={() => window.history.back()}
                  />
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </>
        ) : (
          <>
            {/* Public routes */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </>
        )}
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );

}

export default App;