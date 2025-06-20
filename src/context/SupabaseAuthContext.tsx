import { createContext, useContext, useEffect, useState } from 'react'
import {
  supabase,
  getCurrentUser,
  signOut,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
  onAuthStateChange,
  resetPassword,
  updatePassword,
  getUserProfile,
  updateUserProfile,
  deleteUserAccount
} from '../lib/supabase'
import { syncUserDataToProfile } from '../utils/supabaseClient'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ data?: any, error: any }>
  logout: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
  updatePassword: (newPassword: string) => Promise<{ error: any }>
  getUserProfile: (userId: string) => Promise<{ data: any, error: any }>
  updateUserProfile: (userId: string, updates: any) => Promise<{ data: any, error: any }>
  deleteAccount: () => Promise<{ error: any; data?: any }>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signInWithGoogle: async () => ({ data: null, error: null }),
  logout: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
  getUserProfile: async () => ({ data: null, error: null }),
  updateUserProfile: async () => ({ data: null, error: null }),
  deleteAccount: async () => ({ error: null, data: null })
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for current user on mount
    const fetchUser = async () => {
      try {
        // First check if we have a user in localStorage (for Google auth)
        const storedUser = localStorage.getItem('supabase_user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log('Found stored user in localStorage:', parsedUser);
            // Only use this as a temporary measure while we fetch the real user
            setUser(parsedUser);
          } catch (e) {
            console.error('Error parsing stored user:', e);
          }
        }

        // Always fetch the current user from Supabase
        const currentUser = await getCurrentUser();
        if (currentUser) {
          console.log('Fetched current user from Supabase:', currentUser);
          setUser(currentUser);

          // Update the stored user
          localStorage.setItem('supabase_user', JSON.stringify(currentUser));

          // Sync user profile data to ensure branch and year are up to date
          try {
            await syncUserDataToProfile(currentUser.id);
          } catch (error) {
            console.error('Error syncing user profile data:', error);
          }
        } else {
          console.log('No current user found in Supabase');
          // If no user is found, clear the stored user
          localStorage.removeItem('supabase_user');
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();

    // Check for auth success in URL parameters (for Google auth redirect)
    const checkAuthSuccess = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authSuccess = urlParams.get('auth') === 'success';
      const provider = urlParams.get('provider');

      if (authSuccess && provider === 'google') {
        console.log('Detected successful auth in URL parameters');
        // Refresh the user data
        fetchUser();

        // Clean up the URL
        const url = new URL(window.location.href);
        url.searchParams.delete('auth');
        url.searchParams.delete('provider');
        url.searchParams.delete('t');
        window.history.replaceState({}, document.title, url.toString());
      }
    };

    checkAuthSuccess();

    // Listen for the custom auth success event
    const handleAuthSuccess = (event: Event) => {
      console.log('Received auth success event');
      fetchUser();

      // Trigger browser password save prompt for Google auth
      // This is a custom event that might include user data
      if (event instanceof CustomEvent && event.detail?.user) {
        const user = event.detail.user;
        try {
          // Create a hidden form that will be auto-submitted
          const tempForm = document.createElement('form');
          tempForm.style.display = 'none';
          tempForm.method = 'post';
          tempForm.action = '#'; // Non-navigating action
          tempForm.id = 'google-auth-password-save-form';
          tempForm.autocomplete = 'on';

          // Create email/username field
          const emailField = document.createElement('input');
          emailField.type = 'email';
          emailField.name = 'email';
          emailField.autocomplete = 'email';
          emailField.value = user.email || '';

          // Create username field
          const usernameField = document.createElement('input');
          usernameField.type = 'text';
          usernameField.name = 'username';
          usernameField.autocomplete = 'username';
          usernameField.value = user.email || '';

          // Add a hidden password field with a random value
          // This is just to trigger the browser's password manager
          const passwordField = document.createElement('input');
          passwordField.type = 'password';
          passwordField.name = 'password';
          passwordField.autocomplete = 'current-password';
          passwordField.value = 'google-oauth-' + Date.now();

          // Add fields to form
          tempForm.appendChild(emailField);
          tempForm.appendChild(usernameField);
          tempForm.appendChild(passwordField);

          // Add form to document
          document.body.appendChild(tempForm);

          // Submit the form to trigger browser's password save prompt
          tempForm.submit();

          // Remove the form after a short delay
          setTimeout(() => {
            if (document.body.contains(tempForm)) {
              document.body.removeChild(tempForm);
            }
          }, 1000);

          console.log('Triggered browser password save prompt for Google auth');
        } catch (err) {
          console.error('Error triggering password save for Google auth:', err);
        }
      }
    };

    window.addEventListener('supabase-auth-success', handleAuthSuccess);

    // Also check localStorage for auth completion on mount
    const checkLocalStorageAuth = () => {
      const authCompleted = localStorage.getItem('auth_completed') === 'true';
      const authTimestamp = localStorage.getItem('auth_timestamp');

      if (authCompleted && authTimestamp) {
        const timestamp = parseInt(authTimestamp, 10);
        const now = Date.now();
        // Check if auth was completed in the last 30 seconds
        if (now - timestamp < 30000) {
          console.log('Found recent auth completion in localStorage');
          fetchUser();
        }
      }
    };

    checkLocalStorageAuth();

    // Set up auth state change listener
    const { data: authListener } = onAuthStateChange(async (user) => {
      console.log('Auth state changed, new user:', user);
      setUser(user);
      setLoading(false);

      // Update the stored user
      if (user) {
        localStorage.setItem('supabase_user', JSON.stringify(user));

        // Handle profile creation for new users (especially Google auth)
        try {
          const userId = user.id;
          const userEmail = user.email || '';
          const userName = user.user_metadata?.full_name ||
            user.identities?.[0]?.identity_data?.full_name ||
            userEmail.split('@')[0];

          // Check if user exists in users table
          const { data: existingUser, error: userCheckError } = await supabase
            .from('users')
            .select('id')
            .eq('email', userEmail)
            .single();

          // Create user in users table if doesn't exist
          if (userCheckError && userCheckError.code === 'PGRST116') {
            const { error: userError } = await supabase
              .from('users')
              .insert([{
                id: userId,
                name: userName,
                email: userEmail,
                created_at: new Date().toISOString()
              }]);

            if (userError) {
              console.error('Error creating user in users table:', userError);
            } else {
              console.log('Successfully created user in users table with name:', userName);
            }
          }

          // Check if profile exists
          const { data: existingProfile, error: profileCheckError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .single();

          // Create profile if doesn't exist
          if (profileCheckError && profileCheckError.code === 'PGRST116') {
            const username = userName.toLowerCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 1000);

            const { error: profileError } = await supabase
              .from('profiles')
              .insert([{
                id: userId,
                username: username,
                full_name: userName,
                is_public: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }]);

            if (profileError) {
              console.error('Error creating profile:', profileError);
            } else {
              console.log('Successfully created profile with name:', userName);
            }
          }
        } catch (error) {
          console.error('Error in auth state change profile handling:', error);
        }
      } else {
        localStorage.removeItem('supabase_user');
      }
    });

    // Listen for storage events (for cross-tab synchronization)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'supabase_user') {
        if (event.newValue) {
          try {
            const newUser = JSON.parse(event.newValue);
            setUser(newUser);
          } catch (e) {
            console.error('Error parsing user from storage event:', e);
          }
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Clean up subscriptions
    return () => {
      authListener?.subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('supabase-auth-success', handleAuthSuccess);
    }
  }, [])

  // Authentication methods
  const handleSignIn = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const { data, error } = await signInWithEmail(email, password)

    // If sign-in was successful, ensure user and profile records exist
    if (!error && data?.user) {
      try {
        const userId = data.user.id;
        const userName = email.split('@')[0];

        // Create full name from first and last name, or fallback to email username
        const fullName = firstName && lastName
          ? `${firstName.trim()} ${lastName.trim()}`
          : userName;
        
        console.log('Sign-in successful, ensuring user records exist with name:', fullName);

        // Check if user exists in users table
        const { data: existingUser, error: userCheckError } = await supabase
          .from('users')
          .select('id, name')
          .eq('email', email)
          .single();

        // Create or update user in users table
        if (userCheckError && userCheckError.code === 'PGRST116') {
          // User doesn't exist in users table, create one
          const { error: userError } = await supabase
            .from('users')
            .insert([{
              id: userId,
              name: fullName,
              email: email,
              created_at: new Date().toISOString()
            }]);

          if (userError) {
            console.error('Error creating user in users table during sign-in:', userError);
          } else {
            console.log('Successfully created user in users table during sign-in with name:', fullName);
            // Dispatch event to notify components that user data was created
            window.dispatchEvent(new CustomEvent('user-data-updated'));
          }
        } else if (existingUser && firstName && lastName) {
          // User exists but we have new name info, update it
          const { error: userUpdateError } = await supabase
            .from('users')
            .update({
              name: fullName,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);

          if (userUpdateError) {
            console.error('Error updating user name in users table:', userUpdateError);
          } else {
            console.log('Successfully updated user name in users table to:', fullName);
            // Dispatch event to notify components that user data was updated
            window.dispatchEvent(new CustomEvent('user-data-updated'));
          }
        }

        // Check if profile already exists
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('id', userId)
          .single();

        // Create or update profile
        if (profileCheckError && profileCheckError.code === 'PGRST116') {
          // Profile doesn't exist, create a new one
          const username = userName.toLowerCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 1000);

          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
              id: userId,
              username: username,
              full_name: fullName,
              is_public: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }]);

          if (profileError) {
            console.error('Error creating user profile during sign-in:', profileError);
          } else {
            console.log('Successfully created user profile during sign-in with name:', fullName);
          }
        } else if (existingProfile && firstName && lastName) {
          // Profile exists but we have new name info, update it
          const { error: profileUpdateError } = await supabase
            .from('profiles')
            .update({
              full_name: fullName,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);

          if (profileUpdateError) {
            console.error('Error updating profile name:', profileUpdateError);
          } else {
            console.log('Successfully updated profile name to:', fullName);
          }
        } else if (existingProfile) {
          console.log('User profile already exists, skipping creation');
        } else {
          console.error('Error checking for existing profile:', profileCheckError);
        }
      } catch (profileError) {
        console.error('Error in profile handling during sign-in:', profileError);
      }
    }

    return { error }
  }

  const handleSignUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const { data, error } = await signUpWithEmail(email, password)

    // If signup was successful, create entries in both users and profiles tables
    if (!error && data?.user) {
      try {
        const userId = data.user.id;
        const userName = email.split('@')[0];
        const username = userName.toLowerCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 1000);

        // Create full name from first and last name, or fallback to email username
        const fullName = firstName && lastName
          ? `${firstName.trim()} ${lastName.trim()}`
          : userName;

        // Create user in users table
        const { error: userError } = await supabase
          .from('users')
          .upsert([{
            id: userId,
            name: fullName,
            email: email,
            created_at: new Date().toISOString()
          }], {
            onConflict: 'id'
          });

        if (userError) {
          console.error('Error creating user in users table during signup:', userError);
        } else {
          console.log('Successfully created user in users table during signup with name:', fullName);
          // Dispatch event to notify components that user data was created
          window.dispatchEvent(new CustomEvent('user-data-updated'));
        }

        // First, ensure no old profile exists for this email (cleanup any orphaned data)
        await supabase
          .from('profiles')
          .delete()
          .neq('id', userId) // Don't delete the current user's profile if it somehow exists
          .in('id', [
            // This subquery would need to be handled differently, so we'll just rely on the database constraints
          ]);

        // Create a fresh profile in the profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([{
            id: userId,
            username: username,
            full_name: fullName,
            is_public: true,
            branch: null, // Explicitly set to null to avoid old data
            year: null,
            semester: null,
            college: null,
            bio: null,
            interests: null,
            profile_picture_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }], {
            onConflict: 'id'
          });

        if (profileError) {
          console.error('Error creating user profile during signup:', profileError);
        } else {
          console.log('Successfully created fresh user profile during signup with full name:', fullName);
        }
      } catch (profileError) {
        console.error('Error in profile creation during signup:', profileError);
      }
    }

    return { error }
  }

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle(true)
    return { error }
  }

  const handleLogout = async () => {
    const { error } = await signOut()
    return { error }
  }

  const handleResetPassword = async (email: string) => {
    const { error } = await resetPassword(email)
    return { error }
  }

  const handleUpdatePassword = async (newPassword: string) => {
    const { error } = await updatePassword(newPassword)
    return { error }
  }

  const handleGetUserProfile = async (userId: string) => {
    return await getUserProfile(userId)
  }

  const handleUpdateUserProfile = async (userId: string, updates: any) => {
    return await updateUserProfile(userId, updates)
  }

  const handleDeleteAccount = async () => {
    return await deleteUserAccount()
  }

  const value = {
    user,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signInWithGoogle: handleGoogleSignIn,
    logout: handleLogout,
    resetPassword: handleResetPassword,
    updatePassword: handleUpdatePassword,
    getUserProfile: handleGetUserProfile,
    updateUserProfile: handleUpdateUserProfile,
    deleteAccount: handleDeleteAccount
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

// Export a provider component for React applications
export const SupabaseProvider = AuthProvider
