import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

export const AuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setToken, setUser, fetchUserProfile } = useAuthStore();

  useEffect(() => {
    const handleAuthSuccess = async () => {
      try {
        // Get token from URL parameters
        const token = searchParams.get('token');
        
        if (!token) {
          toast.error('No authentication token received');
          navigate('/auth', { replace: true });
          return;
        }

        console.log('🔑 Received OAuth token, setting up authentication...');

        // Store token
        localStorage.setItem('token', token);
        setToken(token);

        // Fetch user profile
        await fetchUserProfile();

        toast.success('Successfully logged in!');
        
        // Redirect to dashboard
        navigate('/', { replace: true });
        
      } catch (error) {
        console.error('Auth success error:', error);
        toast.error('Authentication failed. Please try again.');
        
        // Clear any stored token
        localStorage.removeItem('token');
        setToken('');
        setUser(null as any);
        
        navigate('/auth', { replace: true });
      }
    };

    handleAuthSuccess();
  }, [searchParams, navigate, setToken, setUser, fetchUserProfile]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">
          Completing your login...
        </h2>
        <p className="mt-2 text-gray-600">
          Please wait while we set up your account.
        </p>
      </div>
    </div>
  );
};
