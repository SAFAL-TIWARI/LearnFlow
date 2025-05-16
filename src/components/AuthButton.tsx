import React, { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset error state when session status changes
  useEffect(() => {
    if (status !== 'loading') {
      setIsLoading(false);
    }
  }, [status]);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if we're on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        // For mobile, use a relative URL to avoid 404 errors
        window.location.href = '/api/auth/signin/google';
      } else {
        // For desktop, use the normal signIn function
        await signIn("google", { callbackUrl: window.location.origin });
      }
    } catch (err) {
      console.error("Sign in error:", err);
      setError("Failed to sign in. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signOut({ callbackUrl: window.location.origin });
    } catch (err) {
      console.error("Sign out error:", err);
      setError("Failed to sign out. Please try again.");
      setIsLoading(false);
    }
  };

  // Show loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center">
        <div className="w-5 h-5 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mr-2"></div>
        <span className="text-gray-700 dark:text-gray-300">Loading...</span>
      </div>
    );
  }

  // Show error message if there is one
  if (error) {
    return (
      <div className="flex items-center text-red-500">
        <span>{error}</span>
        <button
          onClick={() => setError(null)}
          className="ml-2 text-gray-500 hover:text-gray-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Show sign in button (we don't show signed in state anymore as that's handled by UserProfile)
  return (
    <button
      onClick={handleSignIn}
      className="flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-roboto"
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
      Login
    </button>
  );
}