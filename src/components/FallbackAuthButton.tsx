import React, { useState, useEffect } from 'react';
import { getSession, signIn, signOut, isAuthenticated } from '../lib/auth-fallback';

export default function FallbackAuthButton() {
  const [userAuthenticated, setUserAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated using our fallback API
    const checkAuth = async () => {
      try {
        const authenticated = isAuthenticated();
        setUserAuthenticated(authenticated);
        
        if (authenticated) {
          const session = getSession();
          setUserName(session?.user.name || 'User');
        }
      } catch (e) {
        console.error('Failed to check authentication', e);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const session = await signIn();
      setUserAuthenticated(true);
      setUserName(session.user.name);
    } catch (e) {
      console.error('Failed to sign in', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      setUserAuthenticated(false);
      setUserName('');
    } catch (e) {
      console.error('Failed to sign out', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center">
        <div className="w-5 h-5 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mr-2"></div>
        <span className="text-gray-700 dark:text-gray-300">Loading...</span>
      </div>
    );
  }

  // Show authenticated state
  if (userAuthenticated) {
    return (
      <>
        <p className="mr-2 text-gray-700 dark:text-gray-300">Welcome {userName || 'User'}</p>
        <button 
          onClick={handleSignOut}
          className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Sign out
        </button>
      </>
    );
  }

  // Show sign in button
  return (
    <button
      onClick={handleSignIn}
      className="flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
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
      Sign in with Google
    </button>
  );
}