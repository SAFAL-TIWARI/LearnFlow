import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/SupabaseAuthContext';
import { useSafeSession } from '../hooks/useSafeSession';
import { isAuthenticated, getSession } from '../lib/auth-fallback';
import OwnerProfilePage from './OwnerProfilePage';
import UserProfilePage from './UserProfilePage';

// Error fallback component
export const ProfilePageErrorFallback = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 animate-fadeIn">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex items-center mb-6">
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white ml-4">Profile Error</h1>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            {/* We encountered an issue loading your profile. This could be due to a network issue or a temporary server problem. */}
            Please create account first to view your profile. If you already have an account, try logging in again.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-md"
              aria-label="Go back to home page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>

            {/* <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center px-4 py-3 bg-learnflow-500 text-white rounded-lg hover:bg-learnflow-600 transition-all duration-300 hover:shadow-md transform hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Page
            </button> */}
            <button
              onClick={() => window.location.href = '/login'}
              className="flex items-center justify-center px-4 py-3 bg-learnflow-500 text-white rounded-lg hover:bg-learnflow-600 transition-all duration-300 hover:shadow-md transform hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 21h2a2 2 0 002-2V5a2 2 0 00-2-2h-2m-4 14l5-5m0 0l-5-5m5 5H3" />
              </svg>
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfilePageWrapper: React.FC = () => {
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [isCurrentUserProfile, setIsCurrentUserProfile] = useState(true);

  // Try to use Supabase auth first, then NextAuth as fallback
  const { user: supabaseUser } = useAuth();
  const { data: nextAuthSession, status } = useSafeSession();

  useEffect(() => {
    // Check if we're viewing another user's profile from URL
    const urlParams = new URLSearchParams(window.location.search);
    const queryUserId = urlParams.get('userId');

    // Get userId from URL path if available (for /profile/:userId routes)
    const pathParts = window.location.pathname.split('/');
    const pathUserId = pathParts.length > 2 ? pathParts[2] : null;

    // Use either the query parameter or path parameter
    const userId = queryUserId || pathUserId;

    if (userId) {
      setViewingUserId(userId);
      setIsCurrentUserProfile(false);
    } else {
      setIsCurrentUserProfile(true);
    }
  }, []);

  try {
    // If viewing another user's profile
    if (!isCurrentUserProfile && viewingUserId) {
      return <UserProfilePage userId={viewingUserId} />;
    }

    // If viewing own profile
    return <OwnerProfilePage />;
  } catch (error) {
    console.error('Error rendering profile page:', error);
    return <ProfilePageErrorFallback />;
  }
};

export default ProfilePageWrapper;