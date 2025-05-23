import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/SupabaseAuthContext';
import MonkeyAvatar from '../components/MonkeyAvatar';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const emailFieldRef = React.useRef<HTMLInputElement>(null);
  const passwordFieldRef = React.useRef<HTMLInputElement>(null);
  const { signIn, signUp, signInWithGoogle, resetPassword, user } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (user) {
      // If this was opened in a new window, close it and refresh the parent
      if (window.opener) {
        window.opener.location.reload();
        window.close();
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error } = isSignUp
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        setError(error.message);
      } else if (isSignUp) {
        // Show confirmation message for sign up
        setSuccessMessage('Check your email for the confirmation link.');

        // Trigger browser password save prompt for new accounts
        // This is done by submitting a hidden form with the credentials
        triggerPasswordSave(email, password);
      } else {
        // For sign in, also trigger the password save/update prompt
        triggerPasswordSave(email, password);

        // If this was opened in a new window, close it and refresh the parent
        if (window.opener) {
          window.opener.location.reload();
          window.close();
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to trigger browser's password save prompt
  const triggerPasswordSave = (email: string, password: string) => {
    try {
      // Create a hidden form that will be auto-submitted
      const tempForm = document.createElement('form');
      tempForm.style.display = 'none';
      tempForm.method = 'post';
      tempForm.action = '#'; // Non-navigating action
      tempForm.id = 'password-save-form';
      tempForm.autocomplete = 'on';

      // Create email/username field
      const emailField = document.createElement('input');
      emailField.type = 'email';
      emailField.name = 'email';
      emailField.autocomplete = isSignUp ? 'email' : 'username';
      emailField.value = email;

      // Create password field
      const passwordField = document.createElement('input');
      passwordField.type = 'password';
      passwordField.name = 'password';
      passwordField.autocomplete = isSignUp ? 'new-password' : 'current-password';
      passwordField.value = password;

      // Add fields to form
      tempForm.appendChild(emailField);
      tempForm.appendChild(passwordField);

      // Add form to document
      document.body.appendChild(tempForm);

      // Submit the form to trigger browser's password save prompt
      tempForm.submit();

      // Remove the form after a short delay
      setTimeout(() => {
        if (document.body.contains(tempForm)) {
          document.body.removeChild(tempForm);
        }
      }, 1000);

      console.log('Triggered browser password save prompt');
    } catch (err) {
      console.error('Error triggering password save:', err);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Call the Google sign-in function
      const { data, error } = await signInWithGoogle();

      if (error) {
        setError(error.message);
      } else if (data?.url) {
        console.log('Opening Google auth in popup window');

        // Open the URL in a popup window
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
          data.url,
          'googleauth',
          `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );

        // Focus the popup
        if (popup) {
          popup.focus();

          // Set up a message listener to receive auth completion notification
          const messageListener = (event: MessageEvent) => {
            // Verify the message is from our popup
            if (event.data && event.data.type === 'AUTH_COMPLETE') {
              console.log('Received auth complete message from popup', event.data);

              // Remove the listener
              window.removeEventListener('message', messageListener);

              // Navigate to home page or reload to update auth state
              if (window.location.pathname === '/login') {
                navigate('/');
              } else {
                window.location.reload();
              }
            }
          };

          // Add the message listener
          window.addEventListener('message', messageListener);

          // Define a global property to detect auth completion
          (window as any).authCompleted = false;

          // Set up a check to see if the popup was closed or auth completed
          const checkPopupStatus = setInterval(() => {
            // Check if popup was closed
            if (popup.closed) {
              clearInterval(checkPopupStatus);
              window.removeEventListener('message', messageListener);

              // Check if auth was completed by checking localStorage
              const authCompleted = localStorage.getItem('auth_completed') === 'true';
              const authTimestamp = localStorage.getItem('auth_timestamp');

              // Only reload if auth was completed recently (within last 30 seconds)
              if (authCompleted && authTimestamp) {
                const timestamp = parseInt(authTimestamp, 10);
                const now = Date.now();
                if (now - timestamp < 30000) {
                  console.log('Auth was completed, closing login window');

                  // If this is a popup window itself, close it
                  if (window.opener) {
                    // Notify the opener that auth is complete
                    try {
                      window.opener.postMessage({ type: 'AUTH_COMPLETE' }, '*');
                    } catch (e) {
                      console.error('Error posting message to opener:', e);
                    }
                    window.close();
                    return;
                  }

                  // Otherwise redirect to home
                  window.location.href = '/?auth=success&provider=google';
                  return;
                }
              }

              // If we get here, the popup was closed without completing auth
              console.log('Popup closed without completing auth');
              setLoading(false);
            }
          }, 500);
        }

        // The popup will redirect to the callback URL which will handle the rest
        // We don't need to close this window as the callback will handle it
      }
    } catch (err: any) {
      console.error('Google auth error:', err);
      setError(err.message || 'An error occurred during Google authentication');
    } finally {
      // Don't set loading to false here, as we want to keep the loading state
      // until the popup is closed or auth is completed
      if (!data?.url) {
        setLoading(false);
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setError(error.message);
      } else {
        setSuccessMessage('Password reset instructions have been sent to your email');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while requesting password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <div>
          {/* Monkey Avatar */}
          <MonkeyAvatar showPassword={showPassword} passwordFieldRef={passwordFieldRef} emailFieldRef={emailFieldRef} />

          <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccessMessage(null);
              }}
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 mb-4">
            <p className="text-green-700 dark:text-green-400">{successMessage}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleEmailAuth} id="login-form" autoComplete="on">
          {/* Hidden username field to help browsers identify this as a login form */}
          {isSignUp && (
            <input type="text" name="username" autoComplete="username" style={{ display: 'none' }} />
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete={isSignUp ? "email" : "username"}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-700"
                placeholder="Email address"
                ref={emailFieldRef}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-700"
                placeholder="Password"
                ref={passwordFieldRef}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 group"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <div className="relative">
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="absolute left-1/2 transform -translate-x-1/2 -top-10 px-2 py-1 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {!isSignUp && (
            <div className="flex items-center justify-end">
              <div className="text-sm">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Forgot your password?
                </button>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : isSignUp ? (
                'Sign up'
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => window.close()}
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            Close window
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
