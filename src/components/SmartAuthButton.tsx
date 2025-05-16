import React, { useState, useEffect } from 'react';
import ProfileMenu from './ProfileMenu';
import { useAuth } from '../context/SupabaseAuthContext';

export default function SmartAuthButton() {
  const [isLoading, setIsLoading] = useState(true);
  const { loading } = useAuth();

  useEffect(() => {
    // Set a timeout to ensure we don't show loading state for too long
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 1);

    return () => clearTimeout(timeoutId);
  }, []);

  // Show loading state if either our component or the auth context is loading
  if (isLoading || loading) {
    return (
      <div className="flex items-center">
        <div className="w-5 h-5 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mr-2"></div>
        <span className="text-gray-700 dark:text-gray-300">Loading...</span>
      </div>
    );
  }
  
  // Always show the profile menu, regardless of authentication status
  return <ProfileMenu />;
}