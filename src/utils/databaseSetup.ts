import { supabase } from '../lib/supabase'

/**
 * Check if the required database functions exist
 */
export const checkDatabaseFunctions = async () => {
  try {
    console.log('Checking database functions...')
    
    // Test if delete_user function exists
    const { data: deleteUserTest, error: deleteUserError } = await supabase.rpc('delete_user')
    
    if (deleteUserError) {
      console.error('delete_user function test failed:', deleteUserError)
      return {
        deleteUser: false,
        error: deleteUserError.message
      }
    }
    
    console.log('delete_user function is available')
    return {
      deleteUser: true,
      error: null
    }
  } catch (error) {
    console.error('Error checking database functions:', error)
    return {
      deleteUser: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Setup instructions for database functions
 */
export const getDatabaseSetupInstructions = () => {
  return `
To set up the required database functions for user deletion:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run the SQL script from 'supabase_delete_user_function.sql' in the project root
4. Make sure the functions are created successfully

The required functions are:
- delete_user(): Deletes the current user and all associated data
- get_user_files_for_deletion(): Helper function to get user files for storage cleanup

If you're still having issues, check:
- RLS policies are properly configured
- The authenticated role has EXECUTE permissions on these functions
- The functions are created in the correct schema
`
}