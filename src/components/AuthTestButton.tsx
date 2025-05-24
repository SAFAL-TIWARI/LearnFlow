import React from 'react';
import { useUnifiedAuth } from '../hooks/useUnifiedAuth';

const AuthTestButton: React.FC = () => {
  const { isAuthenticated, user, authMethod } = useUnifiedAuth();

  const handleTestSignIn = () => {
    // Create a test authentication entry in localStorage
    const testAuth = {
      isAuthenticated: true,
      user: {
        name: 'Test User',
        email: 'test@example.com'
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    };

    localStorage.setItem('auth-data', JSON.stringify(testAuth));
    localStorage.setItem('user-auth', JSON.stringify({ isAuthenticated: true }));
    
    // Trigger a page refresh to update the auth state
    window.location.reload();
  };

  const handleSignOut = () => {
    // Clear all authentication data
    localStorage.removeItem('auth-data');
    localStorage.removeItem('user-auth');
    localStorage.removeItem('supabase_user');
    
    // Trigger a page refresh to update the auth state
    window.location.reload();
  };

  if (isAuthenticated) {
    return (
      // <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50">
        <div className="text-sm">
          {/* <div>✅ Signed in as: {user?.email || user?.name}</div> */}
          {/* <div>Method: {authMethod}</div> */}
          <button
            // onClick={handleSignOut}
            // className="mt-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
          >
            {/* Sign Out */}
          </button>
        </div>
      // </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50">
      <div className="text-sm">
        <div>❌ Not signed in</div>
        <button
          onClick={handleTestSignIn}
          className="mt-2 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs"
        >
          Test Sign In
        </button>
      </div>
    </div>
  );
};

export default AuthTestButton;
