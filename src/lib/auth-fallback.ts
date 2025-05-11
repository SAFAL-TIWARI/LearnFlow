/**
 * This file provides a fallback authentication mechanism when NextAuth fails
 */
import { getRedirectUri, getGoogleCallbackUrl } from './redirect-uri-helper';

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
    const authData = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!authData) return false;
    
    const { expires } = JSON.parse(authData);
    // Check if the session has expired
    if (new Date(expires) < new Date()) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking authentication status:', error);
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
  try {
    // Get the correct redirect URI using our helper
    const redirectUri = getGoogleCallbackUrl();
    
    // Attempt to redirect to Google's authentication page
    // This is a fallback approach when NextAuth isn't working
    window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?' + 
      'client_id=' + encodeURIComponent(getGoogleClientId()) + 
      '&redirect_uri=' + encodeURIComponent(redirectUri) + 
      '&response_type=code' + 
      '&scope=openid%20email%20profile' + 
      '&prompt=select_account';
    
    // Create a temporary session while redirecting
    const user = {
      name: 'Redirecting...',
      email: 'redirecting@example.com',
      image: 'https://via.placeholder.com/150',
    };
    
    // Set expiration to 1 minute from now (just for the redirect)
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 1);
    
    // Create the session
    const session: FallbackSession = {
      user,
      expires: expires.toISOString(),
    };
    
    return session;
  } catch (error) {
    console.error('Error during Google sign-in redirect:', error);
    
    // Fallback to guest user if redirect fails
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
  }
};

/**
 * Get Google Client ID from environment variables
 */
const getGoogleClientId = (): string => {
  // Try to get from window.process.env first
  if (typeof window !== 'undefined' && window.process?.env?.VITE_GOOGLE_CLIENT_ID) {
    return window.process.env.VITE_GOOGLE_CLIENT_ID;
  }
  
  // Try to get from import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CLIENT_ID) {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID;
  }
  
  // Fallback to empty string if not found
  return '';
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
  const session = getSession();
  const status = session ? 'authenticated' : 'unauthenticated';
  
  return {
    data: session,
    status,
  };
};