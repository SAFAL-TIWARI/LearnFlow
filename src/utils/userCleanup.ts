import { supabase } from '../lib/supabase'

/**
 * Comprehensive user data cleanup utility
 * This ensures all traces of user data are removed from the application
 */
export const performCompleteUserCleanup = async () => {
  try {
    console.log('Starting complete user data cleanup...')
    
    // Clear all localStorage items
    const localStorageKeys = Object.keys(localStorage)
    localStorageKeys.forEach(key => {
      if (
        key.includes('supabase') ||
        key.includes('auth') ||
        key.includes('user') ||
        key.includes('sb-')
      ) {
        localStorage.removeItem(key)
        console.log(`Removed localStorage key: ${key}`)
      }
    })
    
    // Clear sessionStorage
    sessionStorage.clear()
    console.log('Cleared sessionStorage')
    
    // Clear any cookies related to authentication
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    })
    console.log('Cleared cookies')
    
    // Force sign out from Supabase (in case there's still a session)
    try {
      await supabase.auth.signOut()
      console.log('Forced sign out completed')
    } catch (signOutError) {
      console.log('Sign out not needed or already completed')
    }
    
    console.log('Complete user data cleanup finished')
    return true
  } catch (error) {
    console.error('Error during user cleanup:', error)
    return false
  }
}

/**
 * Check if there are any remaining user data traces
 * Useful for debugging
 */
export const checkForUserDataTraces = () => {
  const traces = []
  
  // Check localStorage
  const localStorageKeys = Object.keys(localStorage)
  localStorageKeys.forEach(key => {
    if (
      key.includes('supabase') ||
      key.includes('auth') ||
      key.includes('user') ||
      key.includes('sb-')
    ) {
      traces.push(`localStorage: ${key}`)
    }
  })
  
  // Check sessionStorage
  const sessionStorageKeys = Object.keys(sessionStorage)
  sessionStorageKeys.forEach(key => {
    traces.push(`sessionStorage: ${key}`)
  })
  
  return traces
}