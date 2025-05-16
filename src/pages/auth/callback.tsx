import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      try {
        // Get the URL hash and parse it
        const hash = window.location.hash;
        const query = window.location.search;

        // Log the callback URL for debugging
        console.log('Auth callback URL:', window.location.href);
        console.log('Hash:', hash);
        console.log('Query:', query);

        if (hash || query) {
          // Check for error in the URL
          const urlParams = new URLSearchParams(query || hash.substring(1));
          const errorParam = urlParams.get('error');
          const errorDescription = urlParams.get('error_description');

          if (errorParam) {
            console.error('OAuth error in URL:', errorParam, errorDescription);
            setError(`${errorParam}: ${errorDescription || 'Unknown error'}`);
            return;
          }

          // Process the callback and get the user session
          const { data, error } = await supabase.auth.getSession();

          if (error) {
            console.error('Error in auth callback:', error);
            setError(error.message);
          } else {
            console.log('Authentication successful', data);

            // Get the user data to ensure we have the profile info
            const { data: userData } = await supabase.auth.getUser();
            console.log('User data:', userData);

            // If this was opened in a new window, close it and refresh the parent
            if (window.opener) {
              // Make sure the parent window reloads to get the new user data
              console.log('Closing popup and refreshing parent window');
              window.opener.location.reload();
              window.close();
            } else {
              // Redirect to the home page or dashboard
              navigate('/', { replace: true });
            }
          }
        } else {
          console.log('No hash or query parameters found');
          // No hash or query parameters, redirect to login
          navigate('/login', { replace: true });
        }
      } catch (err: any) {
        console.error('Error processing auth callback:', err);
        setError(err.message || 'An error occurred during authentication');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  // Show a loading state or error
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
        {error ? (
          <div>
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Authentication Error</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Completing Authentication</h2>
            <div className="flex justify-center mb-4">
              <div className="w-8 h-8 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-700 dark:text-gray-300">Please wait while we complete your authentication...</p>
          </div>
        )}
      </div>
    </div>
  );
}
