import { createClient } from '@supabase/supabase-js'
import type { User, Session } from '@supabase/supabase-js'

// Get environment variables
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env?.VITE_SUPABASE_URL
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
    // For localhost:8080 testing, hardcode the callback URL if needed
    let redirectUrl;
    
    if (origin.includes('localhost:8080')) {
      // Use the localhost:8080 callback URL
      redirectUrl = 'http://localhost:8080/auth/callback';
    } else if (redirect) {
      // Use the dynamic origin for other environments
      redirectUrl = `${origin}/auth/callback`;
    } else {
      redirectUrl = undefined;
    }
    
    console.log('Supabase Google OAuth redirect URL:', redirectUrl);

    // Clear any previous auth completion flags (for Google auth)
    localStorage.removeItem('auth_completed');
    localStorage.removeItem('auth_timestamp');
    
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
        
        // Store user data and auth completion flags in localStorage (for Google auth)
        localStorage.setItem('auth_completed', 'true');
        localStorage.setItem('auth_timestamp', Date.now().toString());
        
        if (session.user) {
          localStorage.setItem('supabase_user', JSON.stringify(session.user));
        }
        
        // Dispatch a custom event that can be listened for
        try {
          const authEvent = new CustomEvent('supabase-auth-success', { 
            detail: { user: session.user } 
          });
          window.dispatchEvent(authEvent);
        } catch (e) {
          console.error('Error dispatching auth event:', e);
        }
      }
    });

    // Clean up listener after 60 seconds (increased from 30 seconds)
    setTimeout(() => {
      authListener?.subscription.unsubscribe();
    }, 60000);
    
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

export const deleteUserAccount = async () => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: { message: 'No user found' } }
    }

    console.log('Attempting to delete user account:', user.id)

    // First, get all user files that need to be deleted from storage
    const { data: userFiles, error: filesError } = await supabase.rpc('get_user_files_for_deletion', { 
      user_uuid: user.id 
    })

    if (filesError) {
      console.warn('Could not retrieve user files for deletion:', filesError)
    }

    // Delete files from storage if we have any
    if (userFiles && userFiles.length > 0) {
      console.log(`Deleting ${userFiles.length} files from storage...`)
      
      for (const file of userFiles) {
        try {
          const { error: storageError } = await supabase.storage
            .from(file.bucket_name || 'user-files')
            .remove([file.file_path])
          
          if (storageError) {
            console.warn(`Failed to delete file ${file.file_path}:`, storageError)
          } else {
            console.log(`Successfully deleted file: ${file.file_path}`)
          }
        } catch (fileError) {
          console.warn(`Error deleting file ${file.file_path}:`, fileError)
        }
      }
    }

    // Call the comprehensive database function to delete user and all associated data
    console.log('Calling delete_user database function...')
    const { data: deleteResult, error: deleteError } = await supabase.rpc('delete_user')

    if (deleteError) {
      console.error('Error calling delete_user function:', deleteError)
      
      // Check if the error is due to missing function
      if (deleteError.message?.includes('function delete_user() does not exist') || 
          deleteError.code === '42883') {
        console.error('Database function delete_user does not exist. Please run the setup script.')
        
        // Perform comprehensive cleanup anyway
        const { performCompleteUserCleanup } = await import('../utils/userCleanup')
        await performCompleteUserCleanup()
        
        return { 
          error: { 
            message: 'Database functions not set up. Please contact support to complete account deletion.',
            details: 'The required database functions for user deletion have not been installed. Your local data has been cleared, but server-side data may remain.'
          } 
        }
      }
      
      // If the main function fails, try manual cleanup
      console.log('Attempting manual cleanup...')
      
      // Delete from profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)
      
      if (profileError) {
        console.warn('Error deleting user profile:', profileError)
      } else {
        console.log('Successfully deleted user profile')
      }

      // Delete from user_files table
      const { error: filesTableError } = await supabase
        .from('user_files')
        .delete()
        .eq('user_id', user.id)
      
      if (filesTableError) {
        console.warn('Error deleting user files from database:', filesTableError)
      } else {
        console.log('Successfully deleted user files from database')
      }

      // Delete from file_shares table
      const { error: sharesError } = await supabase
        .from('file_shares')
        .delete()
        .or(`user_id.eq.${user.id},shared_with_id.eq.${user.id}`)
      
      if (sharesError) {
        console.warn('Error deleting file shares:', sharesError)
      } else {
        console.log('Successfully deleted file shares')
      }

      // Try to delete from users table if it exists
      const { error: usersTableError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id)
      
      if (usersTableError) {
        console.warn('Error deleting from users table (might not exist):', usersTableError)
      } else {
        console.log('Successfully deleted from users table')
      }

      // The auth user deletion should be handled by the database function
      // If it fails, we'll proceed with cleanup anyway
      console.log('Manual cleanup completed, but auth user deletion may have failed')
      
      // Perform comprehensive cleanup
      const { performCompleteUserCleanup } = await import('../utils/userCleanup')
      await performCompleteUserCleanup()

      return { 
        error: { 
          message: 'Account deletion partially completed. Some data may remain in the system.',
          details: deleteError
        } 
      }
    }

    console.log('User account deleted successfully via database function:', deleteResult)

    // Perform comprehensive cleanup using our utility function
    const { performCompleteUserCleanup } = await import('../utils/userCleanup')
    await performCompleteUserCleanup()

    console.log('User account deletion process completed successfully')
    return { error: null, data: deleteResult }
    
  } catch (error) {
    console.error('Unexpected error deleting account:', error)
    
    // Even if there's an error, try to clean up local data
    try {
      const { performCompleteUserCleanup } = await import('../utils/userCleanup')
      await performCompleteUserCleanup()
    } catch (cleanupError) {
      console.error('Cleanup also failed:', cleanupError)
    }
    
    return { 
      error: { 
        message: error instanceof Error ? error.message : 'Failed to delete account',
        details: error
      } 
    }
  }
}

// Auth state change listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return supabase.auth.onAuthStateChange((_, session) => {
    callback(session?.user || null)
  })
}