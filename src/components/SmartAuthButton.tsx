import React, { useState, useEffect } from 'react';
import AuthButton from './AuthButton';
import FallbackAuthButton from './FallbackAuthButton';

export default function SmartAuthButton() {
  const [nextAuthFailed, setNextAuthFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if NextAuth is working by looking for errors
    const checkNextAuth = () => {
      try {
        // Check for auth parameters in URL (for mobile redirect)
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const authStatus = urlParams.get('auth');
          
          if (authStatus === 'success') {
            // If we have a successful auth from the URL, use the fallback
            // This is for mobile devices that were redirected
            setNextAuthFailed(true);
            setIsLoading(false);
            
            // Remove the auth parameters from the URL without refreshing
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
            return;
          }
        }
        
        // Create a test function to see if we can access NextAuth
        const testNextAuth = () => {
          try {
            // Check if we're on mobile - if so, use fallback for simplicity
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (isMobile) {
              console.log('Mobile device detected, using fallback auth');
              return false;
            }
            
            // Check if process.env is properly defined
            if (typeof window !== 'undefined' && 
                (!window.process || !window.process.env || !window.process.env.NEXTAUTH_URL)) {
              console.warn('NextAuth environment variables not properly defined');
              return false;
            }
            return true;
          } catch (error) {
            console.error('Error testing NextAuth:', error);
            return false;
          }
        };

        // If NextAuth test fails, use fallback
        if (!testNextAuth()) {
          setNextAuthFailed(true);
        }

        // Monitor for NextAuth errors
        const originalConsoleError = console.error;
        console.error = (...args) => {
          if (args[0] && typeof args[0] === 'string' && 
              (args[0].includes('process is not defined') || 
               args[0].includes('next-auth'))) {
            setNextAuthFailed(true);
          }
          originalConsoleError(...args);
        };

        // Restore original after a short time
        setTimeout(() => {
          console.error = originalConsoleError;
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error in checkNextAuth:', error);
        setNextAuthFailed(true);
        setIsLoading(false);
      }
    };

    checkNextAuth();

    // Also set a timeout to check if NextAuth is still failing after a few seconds
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center">
        <div className="w-5 h-5 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mr-2"></div>
        <span className="text-gray-700 dark:text-gray-300">Loading...</span>
      </div>
    );
  }

  // If NextAuth failed, use the fallback
  if (nextAuthFailed) {
    return <FallbackAuthButton />;
  }

  // Otherwise use the real NextAuth button with error handling
  return (
    <AuthErrorBoundary fallback={<FallbackAuthButton />}>
      <AuthButton />
    </AuthErrorBoundary>
  );
}

// Simple error boundary component for auth buttons
class AuthErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
}

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Auth button error:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

