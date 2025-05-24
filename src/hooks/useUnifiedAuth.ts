import { useState, useEffect } from 'react';
import { useAuth as useSupabaseAuth } from '../context/SupabaseAuthContext';
import { useSession as useFallbackSession } from '../lib/auth-fallback';
import { isAuthenticated as isFallbackAuthenticated } from '../lib/auth-fallback';

interface UnifiedAuthState {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  authMethod: 'supabase' | 'nextauth' | 'fallback' | 'none';
}

/**
 * Unified authentication hook that checks all authentication methods
 * and returns a consistent authentication state
 */
export const useUnifiedAuth = (): UnifiedAuthState => {
  const { user: supabaseUser, loading: supabaseLoading } = useSupabaseAuth();
  const { data: fallbackSession, status: fallbackStatus } = useFallbackSession();
  
  const [authState, setAuthState] = useState<UnifiedAuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    authMethod: 'none'
  });

  useEffect(() => {
    const determineAuthState = () => {
      // Priority 1: Supabase authentication (primary method)
      if (supabaseUser && !supabaseLoading) {
        console.log('✅ Authenticated via Supabase:', supabaseUser.email);
        setAuthState({
          isAuthenticated: true,
          user: supabaseUser,
          loading: false,
          authMethod: 'supabase'
        });
        return;
      }

      // Priority 2: NextAuth/Fallback session
      if (fallbackStatus === 'authenticated' && fallbackSession) {
        console.log('✅ Authenticated via NextAuth/Fallback session');
        setAuthState({
          isAuthenticated: true,
          user: fallbackSession.user,
          loading: false,
          authMethod: 'nextauth'
        });
        return;
      }

      // Priority 3: Fallback authentication methods
      if (isFallbackAuthenticated()) {
        console.log('✅ Authenticated via fallback auth');
        setAuthState({
          isAuthenticated: true,
          user: { name: 'Authenticated User', email: 'user@example.com' },
          loading: false,
          authMethod: 'fallback'
        });
        return;
      }

      // Priority 4: Check localStorage for any auth tokens
      try {
        const localStorageChecks = [
          localStorage.getItem('supabase_user'),
          localStorage.getItem('auth-data'),
          localStorage.getItem('user-auth')
        ];

        for (const item of localStorageChecks) {
          if (item) {
            try {
              const parsed = JSON.parse(item);
              if (parsed && (parsed.user || parsed.isAuthenticated)) {
                console.log('✅ Authenticated via localStorage');
                setAuthState({
                  isAuthenticated: true,
                  user: parsed.user || { name: 'Local User', email: 'local@example.com' },
                  loading: false,
                  authMethod: 'fallback'
                });
                return;
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      } catch (e) {
        console.error('Error checking localStorage:', e);
      }

      // No authentication found
      console.log('❌ No authentication found');
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: supabaseLoading,
        authMethod: 'none'
      });
    };

    determineAuthState();
  }, [supabaseUser, supabaseLoading, fallbackSession, fallbackStatus]);

  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Unified Auth Debug:', {
        supabaseUser: supabaseUser?.email || 'none',
        supabaseLoading,
        fallbackStatus,
        fallbackSession: fallbackSession?.user?.email || 'none',
        fallbackAuth: isFallbackAuthenticated(),
        finalState: authState
      });
    }
  }, [authState, supabaseUser, supabaseLoading, fallbackSession, fallbackStatus]);

  return authState;
};

export default useUnifiedAuth;
