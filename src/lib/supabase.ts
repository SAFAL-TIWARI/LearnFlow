import { createClient } from '@supabase/supabase-js'
import type { User, Session } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env?.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env?.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl as string,
  supabaseAnonKey as string
)

// Authentication methods
export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    }
  })
  return { data, error }
}

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signInWithGoogle = async (redirect: boolean = false) => {
  try {
    // Get the current origin for the redirect URL
    const origin = window.location.origin;
    // Make sure the redirect URL matches exactly what's configured in Supabase and Google Cloud Console
    const redirectUrl = redirect ? `${origin}/auth/callback` : undefined;
    console.log('Supabase Google OAuth redirect URL:', redirectUrl);

    // Add a timestamp to prevent caching issues
    const timestamp = Date.now();
    
    // Use a popup window for Google sign-in with simplified options
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        // Simplify the scopes to just what's needed
        scopes: 'email profile',
        queryParams: {
          // Ensure we get a refresh token
          access_type: 'offline',
          // Force consent screen to ensure we get refresh token
          prompt: 'consent',
          // Add timestamp to prevent caching issues
          state: `st_${timestamp}`
        }
      }
    });

    if (error) {
      console.error('Supabase Google OAuth error:', error);
      return { data: null, error };
    } 
    
    console.log('Google sign-in initiated successfully', data);
    
    // Add a listener to check for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in:', session.user);
        
        // Store a flag in localStorage to indicate successful sign-in
        // This can be used to detect if the user completed the flow
        localStorage.setItem('auth_completed', 'true');
      }
    });

    // Clean up listener after 30 seconds (increased from 10 seconds)
    setTimeout(() => {
      authListener?.subscription.unsubscribe();
    }, 30000);
    
    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error during Google sign-in:', err);
    return { 
      data: null, 
      error: {
        message: err instanceof Error ? err.message : 'Unknown error during Google authentication',
        status: 500
      }
    };
  }
}
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getCurrentSession = async (): Promise<Session | null> => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`
  })
  return { data, error }
}

export const updatePassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  })
  return { data, error }
}

// User profile methods
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
  return { data, error }
}

// Auth state change listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return supabase.auth.onAuthStateChange((_, session) => {
    callback(session?.user || null)
  })
}