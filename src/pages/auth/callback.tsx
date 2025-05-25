import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Flag to prevent multiple processing attempts
    let isProcessing = false;
    
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      // Prevent multiple processing attempts of the same code
      if (isProcessing) return;
      isProcessing = true;
      
      try {
        // Get the URL hash and parse it
        const hash = window.location.hash;
        const query = window.location.search;

        // Log the callback URL for debugging
        console.log('Auth callback URL:', window.location.href);
        console.log('Hash:', hash);
        console.log('Query:', query);

        // Check for server error in the URL
        if (query.includes('server_error') || query.includes('error=')) {
          const urlParams = new URLSearchParams(query);
          const serverError = urlParams.get('server_error') || urlParams.get('error');
          const errorDescription = urlParams.get('error_description');

          console.error('Error in OAuth callback:', serverError, errorDescription);

          // Handle specific error cases
          if (serverError?.includes('Unable to exchange external code')) {
            setError(`The authentication code has expired or already been used. This typically happens if:
            
1. You refreshed the page during authentication
2. The browser took too long to complete the process
3. You tried to authenticate multiple times

Please return to login and try again.`);
          } else if (serverError === 'Unknown error') {
            setError(`Authentication failed. This could be due to a configuration issue between Supabase and Google. Please check that the redirect URLs are correctly configured in both Supabase and Google Cloud Console.`);
          } else {
            setError(`Server error: ${serverError || 'Unknown error'}${errorDescription ? ` - ${errorDescription}` : ''}`);
          }
          return;
        }

        // Check if we have a code parameter in the URL
        const urlParams = new URLSearchParams(query || hash.substring(1));
        const code = urlParams.get('code');
        
        if (!code) {
          console.log('No authentication code found in URL');
          navigate('/login?mode=signin', { replace: true });
          return;
        }
        
        console.log('Found authentication code, attempting to exchange...');

        // Process the callback with Supabase
        try {
          // Clear any existing session first to avoid conflicts
          await supabase.auth.signOut();
          
          // Now exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(
            window.location.href
          );

          if (error) {
            console.error('Error exchanging code for session:', error);
            setError(`Authentication error: ${error.message}`);
          } else {
            console.log('Authentication successful', data);

            // Get the user data to ensure we have the profile info
            const { data: userData } = await supabase.auth.getUser();
            console.log('User data:', userData);

            // If this was opened in a new window, close it and refresh the parent
            if (window.opener) {
              try {
                // Store authentication data in localStorage before closing
                // This ensures the parent window can access it immediately
                localStorage.setItem('auth_completed', 'true');
                localStorage.setItem('auth_timestamp', Date.now().toString());
                
                // Store user data in localStorage for immediate access in parent window
                if (userData?.user) {
                  localStorage.setItem('supabase_user', JSON.stringify(userData.user));
                }
                
                console.log('Closing popup and refreshing parent window');
                
                // Try multiple methods to communicate with the parent window
                
                // 1. Post a message to the parent window
                try {
                  window.opener.postMessage({ 
                    type: 'AUTH_COMPLETE', 
                    user: userData?.user,
                    timestamp: Date.now()
                  }, '*');
                  console.log('Posted message to parent window');
                } catch (msgErr) {
                  console.error('Error posting message to parent:', msgErr);
                }
                
                // 2. Try to set a flag in the parent window directly
                try {
                  window.opener.authCompleted = true;
                  window.opener.authUser = userData?.user;
                  console.log('Set auth flags in parent window');
                } catch (flagErr) {
                  console.error('Error setting flags in parent window:', flagErr);
                }
                
                // 3. Force the parent window to reload/redirect and close this window
                console.log('Redirecting parent window and closing popup');
                
                // Force a delay to ensure the session is properly set before closing
                setTimeout(() => {
                  try {
                    // Redirect the parent window to the home page with success parameters
                    // Use the correct URL (localhost:8080 or whatever is configured)
                    const baseUrl = window.opener.location.origin;
                    const redirectUrl = `${baseUrl}/?auth=success&provider=google&t=${Date.now()}`;
                    window.opener.location.href = redirectUrl;
                    console.log('Redirected parent to:', redirectUrl);
                    
                    // Close this popup window immediately
                    console.log('Closing popup window');
                    window.close();
                  } catch (redirectErr) {
                    console.error('Error redirecting parent window:', redirectErr);
                    // If we can't redirect, try to close anyway
                    window.close();
                  }
                }, 800);
              } catch (err) {
                console.error('Error closing window:', err);
                // If we can't close the window, navigate to home
                navigate('/', { replace: true });
              }
            } else {
              // Redirect to the home page or dashboard with success parameters
              navigate('/?auth=success&provider=google&t=' + Date.now(), { replace: true });
            }
          }
        } catch (exchangeError: any) {
          console.error('Exception during code exchange:', exchangeError);
          setError(`Failed to complete authentication: ${exchangeError.message || 'Unknown error'}`);
        }
      } catch (err: any) {
        console.error('Error processing auth callback:', err);
        setError(err.message || 'An error occurred during authentication');
      } finally {
        isProcessing = false;
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

            {error.includes('configuration issue') && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md mb-4">
                <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Configuration Tips:</h3>
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>Make sure the redirect URL in Supabase matches exactly: <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{window.location.origin}/auth/callback</code></li>
                  <li>In Google Cloud Console, add this URL to both "Authorized JavaScript origins" and "Authorized redirect URIs"</li>
                  <li>Check that you're using the correct Client ID and Client Secret in your Supabase configuration</li>
                  <li>Try clearing your browser cookies and cache before attempting again</li>
                </ul>
              </div>
            )}
            
            {error.includes('expired or already been used') && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md mb-4">
                <h3 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2">How to Fix This:</h3>
                <ol className="list-decimal list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>Return to the login page using the button below</li>
                  <li>Clear your browser cookies and cache</li>
                  <li>Try signing in with Google again</li>
                  <li>Complete the process without refreshing or navigating away</li>
                </ol>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  This error happens because OAuth authorization codes can only be used once and expire quickly.
                </p>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/login?mode=signin')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Return to Login
              </button>

              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Try Again
              </button>
            </div>
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
