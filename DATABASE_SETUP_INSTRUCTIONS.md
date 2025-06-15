# Database Setup Instructions for Complete User Deletion

## Overview
This guide will help you set up the necessary database functions and policies to ensure complete user account deletion, including all associated data and files.

## Step 1: Create the Database Functions

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run the SQL code from `supabase_delete_user_function.sql`

This will create two functions:
- `delete_user()`: Completely removes a user and all associated data
- `get_user_files_for_deletion(uuid)`: Helper function to get file paths for storage cleanup

## Step 2: Set Up Row Level Security (RLS) Policies

Run these SQL commands to ensure proper security:

```sql
-- Enable RLS on all tables if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_shares ENABLE ROW LEVEL SECURITY;

-- Policy for profiles table
CREATE POLICY "Users can delete their own profile" ON profiles
    FOR DELETE USING (auth.uid() = id);

-- Policy for user_files table  
CREATE POLICY "Users can delete their own files" ON user_files
    FOR DELETE USING (auth.uid() = user_id);

-- Policy for file_shares table
CREATE POLICY "Users can delete their own file shares" ON file_shares
    FOR DELETE USING (auth.uid() = user_id OR auth.uid() = shared_with_id);
```

## Step 3: Set Up Storage Policies

Ensure users can delete their own files from storage:

```sql
-- Policy for storage buckets (run in SQL Editor)
CREATE POLICY "Users can delete their own files from storage" ON storage.objects
    FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
```

## Step 4: Test the Setup

1. Create a test user account
2. Add some profile information and upload files
3. Delete the account using the delete button
4. Try to create a new account with the same email
5. Verify that no old data appears

## Step 5: Verify Database Function Exists

You can verify the function was created by running:

```sql
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('delete_user', 'get_user_files_for_deletion');
```

## Troubleshooting

### If the delete_user function fails:
1. Check the function exists in your database
2. Verify RLS policies are set correctly
3. Check the browser console for detailed error messages
4. Ensure the authenticated user has permission to execute the function

### If old data still appears:
1. Check if the `users` table exists and has the correct structure
2. Verify that the sync function isn't pulling data from an external source
3. Clear browser cache and localStorage manually
4. Check if there are any cached API responses

### If files aren't deleted from storage:
1. Verify storage policies are set correctly
2. Check if the bucket names match (user-files vs user_files)
3. Ensure the file paths in the database match the actual storage paths

## Database Schema Requirements

Your database should have these tables:
- `profiles`: User profile information
- `user_files`: File metadata and paths
- `file_shares`: File sharing relationships
- `users`: Additional user data (optional)

The `delete_user()` function will handle cleanup of all these tables automatically.