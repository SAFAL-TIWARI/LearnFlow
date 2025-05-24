/**
 * This file provides a fallback authentication mechanism when NextAuth fails
 */

// Store the authentication state in localStorage
const AUTH_STORAGE_KEY = 'auth-fallback-state';

// Define the session interface
export interface FallbackSession {
  user: {
    name: string;
    email: string;
    image?: string;
  };
  expires: string; // ISO date string
}

/**
 * Check if the user is authenticated
 */
export const isAuthenticated = (): boolean => {
  try {
    // First check if we have auth data in localStorage
    const authData = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!authData) {
      // Also check for user-auth as a fallback (used in ResourceFiles.tsx)
      const userAuth = localStorage.getItem('user-auth');
      if (userAuth) {
        try {
          const parsed = JSON.parse(userAuth);
          if (parsed && parsed.isAuthenticated === true) {
            return true;
          }
        } catch (e) {
          console.error('Failed to parse user-auth', e);
        }
      }
      return false;
    }
    
    const { expires } = JSON.parse(authData);
    // Check if the session has expired
    if (new Date(expires) < new Date()) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking authentication status:', error);
    // As a last resort, check for user-auth
    try {
      const userAuth = localStorage.getItem('user-auth');
      if (userAuth) {
        const parsed = JSON.parse(userAuth);
        return parsed && parsed.isAuthenticated === true;
      }
    } catch (e) {
      // Ignore errors in fallback
    }
    return false;
  }
};

/**
 * Get the current session
 */
export const getSession = (): FallbackSession | null => {
  try {
    if (!isAuthenticated()) return null;
    
    const authData = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!authData) return null;
    
    return JSON.parse(authData);
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

/**
 * Sign in a user
 */
export const signIn = async (): Promise<FallbackSession> => {
  // Create a mock user
  const user = {
    name: 'Guest User',
    email: 'guest@example.com',
    image: 'https://via.placeholder.com/150',
  };
  
  // Set expiration to 7 days from now
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);
  
  // Create the session
  const session: FallbackSession = {
    user,
    expires: expires.toISOString(),
  };
  
  // Store in localStorage
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  
  return session;
};

/**
 * Sign out a user
 */
export const signOut = async (): Promise<void> => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

/**
 * Create a hook to use the session
 */
export const useSession = () => {
  // Check for session
  const session = getSession();
  
  // Also check for user-auth as a fallback
  let status = 'unauthenticated';
  
  if (session) {
    status = 'authenticated';
  } else {
    try {
      const userAuth = localStorage.getItem('user-auth');
      if (userAuth) {
        const parsed = JSON.parse(userAuth);
        if (parsed && parsed.isAuthenticated === true) {
          status = 'authenticated';
        }
      }
    } catch (e) {
      console.error('Error checking user-auth in useSession', e);
    }
  }
  
  return {
    data: session,
    status,
  };
};