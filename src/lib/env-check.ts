/**
 * This file checks if the environment variables are loaded correctly
 * and provides fallback values if they are not.
 */

// Check if the environment variables are loaded
const checkEnvVars = () => {
  const envVars = [
    'VITE_NEXTAUTH_URL',
    'VITE_NEXTAUTH_SECRET',
    'VITE_GOOGLE_CLIENT_ID',
    'VITE_GOOGLE_CLIENT_SECRET',
  ];

  const missingVars = envVars.filter(
    (varName) => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn(
      `Missing environment variables: ${missingVars.join(', ')}. Using fallback values.`
    );
    
    // Set fallback values
    if (typeof window !== 'undefined' && window.process && window.process.env) {
      if (!window.process.env.NEXTAUTH_URL) {
        window.process.env.NEXTAUTH_URL = window.location.origin;
      }
      
      if (!window.process.env.NEXTAUTH_SECRET) {
        window.process.env.NEXTAUTH_SECRET = 'fallback-secret-key';
      }
      
      if (!window.process.env.GOOGLE_CLIENT_ID) {
        window.process.env.GOOGLE_CLIENT_ID = '';
      }
      
      if (!window.process.env.GOOGLE_CLIENT_SECRET) {
        window.process.env.GOOGLE_CLIENT_SECRET = '';
      }
    }
    
    return false;
  }
  
  return true;
};

// Run the check
const envVarsLoaded = checkEnvVars();

// Export the result
export const ENV_VARS_LOADED = envVarsLoaded;

// Export environment variables with fallbacks
export const NEXTAUTH_URL = import.meta.env.VITE_NEXTAUTH_URL || (typeof window !== 'undefined' ? window.location.origin : '');
export const NEXTAUTH_SECRET = import.meta.env.VITE_NEXTAUTH_SECRET || 'fallback-secret-key';
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
export const GOOGLE_CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '';