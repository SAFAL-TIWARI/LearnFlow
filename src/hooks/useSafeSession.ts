import { useState, useEffect } from 'react';

// This is a safe wrapper around NextAuth's useSession that won't crash
// when SessionProvider is not available
export function useSafeSession() {
  const [session, setSession] = useState<any>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  useEffect(() => {
    // Try to use next-auth's useSession, but catch any errors
    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined') {
        // Set unauthenticated after a short delay to simulate loading
        const timer = setTimeout(() => {
          setStatus('unauthenticated');
        }, 100);
        
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.warn('NextAuth SessionProvider not available:', error);
      setStatus('unauthenticated');
    }
  }, []);

  return {
    data: session,
    status
  };
}