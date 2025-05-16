/**
 * Helper functions for handling redirect URIs in OAuth flows
 */

/**
 * Get the correct redirect URI for OAuth based on the current environment
 * This ensures we use the correct URI that matches what's configured in Google Cloud Console
 */
export const getRedirectUri = (): string => {
  // For server-side
  if (typeof process !== 'undefined') {
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    if (process.env.VITE_NEXTAUTH_URL) {
      return process.env.VITE_NEXTAUTH_URL;
    }
    if (process.env.NEXTAUTH_URL) {
      return process.env.NEXTAUTH_URL;
    }
  }

  // For client-side
  if (typeof window !== 'undefined') {
    // Check if we're on the Vercel deployment
    if (window.location.hostname.includes('vercel.app')) {
      return 'https://learn-flow-seven.vercel.app';
    }

    // Check if we have the URL in window.process.env
    if (window.process?.env?.VITE_NEXTAUTH_URL) {
      return window.process.env.VITE_NEXTAUTH_URL;
    }

    // Log the current origin for debugging
    console.log('Current origin:', window.location.origin);

    // Default to current origin
    return window.location.origin;
  }

  // Fallback
  return 'https://learn-flow-seven.vercel.app';
};

/**
 * Get the Google OAuth callback URL
 * This should match exactly what's configured in Google Cloud Console
 */
export const getGoogleCallbackUrl = (): string => {
  const baseUrl = getRedirectUri();
  // Log the callback URL for debugging
  const callbackUrl = `${baseUrl}/api/auth/callback/google`;
  console.log('Google callback URL:', callbackUrl);
  return callbackUrl;
};