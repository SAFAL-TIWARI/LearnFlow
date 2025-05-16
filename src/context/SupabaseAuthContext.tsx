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
  updateUserProfile
} from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ error: any }>
  logout: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
  updatePassword: (newPassword: string) => Promise<{ error: any }>
  getUserProfile: (userId: string) => Promise<{ data: any, error: any }>
  updateUserProfile: (userId: string, updates: any) => Promise<{ data: any, error: any }>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signInWithGoogle: async () => ({ error: null }),
  logout: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
  getUserProfile: async () => ({ data: null, error: null }),
  updateUserProfile: async () => ({ data: null, error: null })
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for current user on mount
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()

    // Set up auth state change listener
    const { data: authListener } = onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
    })

    // Clean up subscription
    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  // Authentication methods
  const handleSignIn = async (email: string, password: string) => {
    const { error } = await signInWithEmail(email, password)
    return { error }
  }

  const handleSignUp = async (email: string, password: string) => {
    const { error } = await signUpWithEmail(email, password)
    return { error }
  }

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle()
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
    updateUserProfile: handleUpdateUserProfile
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
