import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/SupabaseAuthContext';
import '../components/MonkeyAvatar.module.css';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp, signInWithGoogle, user } = useAuth();
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const { error } = await signUp(email, password);

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        
        // Trigger browser password save prompt for new accounts
        triggerPasswordSave(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up');
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
      
      // Create email field
      const emailField = document.createElement('input');
      emailField.type = 'email';
      emailField.name = 'email';
      emailField.autocomplete = 'email';
      emailField.value = email;
      
      // Create username field (using email as username)
      const usernameField = document.createElement('input');
      usernameField.type = 'text';
      usernameField.name = 'username';
      usernameField.autocomplete = 'username';
      usernameField.value = email;
      
      // Create password field
      const passwordField = document.createElement('input');
      passwordField.type = 'password';
      passwordField.name = 'password';
      passwordField.autocomplete = 'new-password';
      passwordField.value = password;
      
      // Add fields to form
      tempForm.appendChild(emailField);
      tempForm.appendChild(usernameField);
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
      
      console.log('Triggered browser password save prompt for new account');
    } catch (err) {
      console.error('Error triggering password save:', err);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during Google authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login?mode=signin"
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Sign in
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 mb-4">
            <p className="text-green-700 dark:text-green-400">
              Registration successful! Please check your email for a confirmation link.
            </p>
          </div>
        )}

        {/* Monkey UI */}
        <input
          className="blind-check"
          type="checkbox"
          id="blind-input"
          checked={!showPassword}
          onChange={() => {
            setShowPassword(!showPassword);
            setShowConfirmPassword(!showConfirmPassword);
          }}
          hidden
        />

        <div className="monkey-avatar">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="35"
            height="35"
            viewBox="0 0 64 64"
            id="monkey"
          >
            <ellipse cx="53.7" cy="33" rx="8.3" ry="8.2" fill="#89664c"></ellipse>
            <ellipse cx="53.7" cy="33" rx="5.4" ry="5.4" fill="#ffc5d3"></ellipse>
            <ellipse cx="10.2" cy="33" rx="8.2" ry="8.2" fill="#89664c"></ellipse>
            <ellipse cx="10.2" cy="33" rx="5.4" ry="5.4" fill="#ffc5d3"></ellipse>
            <g fill="#89664c">
              <path
                d="m43.4 10.8c1.1-.6 1.9-.9 1.9-.9-3.2-1.1-6-1.8-8.5-2.1 1.3-1 2.1-1.3 2.1-1.3-20.4-2.9-30.1 9-30.1 19.5h46.4c-.7-7.4-4.8-12.4-11.8-15.2"
              ></path>
              <path
                d="m55.3 27.6c0-9.7-10.4-17.6-23.3-17.6s-23.3 7.9-23.3 17.6c0 2.3.6 4.4 1.6 6.4-1 2-1.6 4.2-1.6 6.4 0 9.7 10.4 17.6 23.3 17.6s23.3-7.9 23.3-17.6c0-2.3-.6-4.4-1.6-6.4 1-2 1.6-4.2 1.6-6.4"
              ></path>
            </g>
            <path
              d="m52 28.2c0-16.9-20-6.1-20-6.1s-20-10.8-20 6.1c0 4.7 2.9 9 7.5 11.7-1.3 1.7-2.1 3.6-2.1 5.7 0 6.1 6.6 11 14.7 11s14.7-4.9 14.7-11c0-2.1-.8-4-2.1-5.7 4.4-2.7 7.3-7 7.3-11.7"
              fill="#e0ac7e"
            ></path>
            <g fill="#3b302a" className="monkey-eye-nose">
              <path
                d="m35.1 38.7c0 1.1-.4 2.1-1 2.1-.6 0-1-.9-1-2.1 0-1.1.4-2.1 1-2.1.6.1 1 1 1 2.1"
              ></path>
              <path
                d="m30.9 38.7c0 1.1-.4 2.1-1 2.1-.6 0-1-.9-1-2.1 0-1.1.4-2.1 1-2.1.5.1 1 1 1 2.1"
              ></path>
              <ellipse
                cx="40.7"
                cy="31.7"
                rx="3.5"
                ry="4.5"
                className="monkey-eye-r"
              ></ellipse>
              <ellipse
                cx="23.3"
                cy="31.7"
                rx="3.5"
                ry="4.5"
                className="monkey-eye-l"
              ></ellipse>
            </g>
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="35"
            height="35"
            viewBox="0 0 64 64"
            id="monkey-hands"
          >
            <path
              fill="#89664C"
              d="M9.4,32.5L2.1,61.9H14c-1.6-7.7,4-21,4-21L9.4,32.5z"
            ></path>
            <path
              fill="#FFD6BB"
              d="M15.8,24.8c0,0,4.9-4.5,9.5-3.9c2.3,0.3-7.1,7.6-7.1,7.6s9.7-8.2,11.7-5.6c1.8,2.3-8.9,9.8-8.9,9.8
            s10-8.1,9.6-4.6c-0.3,3.8-7.9,12.8-12.5,13.8C11.5,43.2,6.3,39,9.8,24.4C11.6,17,13.3,25.2,15.8,24.8"
            ></path>
            <path
              fill="#89664C"
              d="M54.8,32.5l7.3,29.4H50.2c1.6-7.7-4-21-4-21L54.8,32.5z"
            ></path>
            <path
              fill="#FFD6BB"
              d="M48.4,24.8c0,0-4.9-4.5-9.5-3.9c-2.3,0.3,7.1,7.6,7.1,7.6s-9.7-8.2-11.7-5.6c-1.8,2.3,8.9,9.8,8.9,9.8
            s-10-8.1-9.7-4.6c0.4,3.8,8,12.8,12.6,13.8c6.6,1.3,11.8-2.9,8.3-17.5C52.6,17,50.9,25.2,48.4,24.8"
            ></path>
          </svg>
        </div>

        <label htmlFor="blind-input" className="blind-toggle">
          <span className="hide">Hide Passwords</span>
          <span className="show">Show Passwords</span>
        </label>

        <form className="mt-8 space-y-6 form-container" onSubmit={handleSignUp} id="signup-form" autoComplete="on">
          {/* Hidden username field to help browsers identify this as a signup form */}
          <input type="text" name="username" autoComplete="username" style={{ display: 'none' }} />
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-700"
                placeholder="Email address"
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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-700"
                placeholder="Password"
              />
            </div>
            <div className="relative">
              <label htmlFor="confirm-password" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-700"
                placeholder="Confirm password"
              />
            </div>
          </div>

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
              ) : (
                'Sign up'
              )}
            </button>
          </div>
        </form>

        {/* <div className="mt-6">
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
        </div> */}

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            Return to home page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;

