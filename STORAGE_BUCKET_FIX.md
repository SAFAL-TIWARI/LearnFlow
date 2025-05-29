# Storage Bucket Fix

## Issues Fixed

1. **Column "file_path" does not exist error**
   - The SQL script was using the correct column name as defined in the database schema, but there was an issue with the SQL execution.

2. **Bucket name inconsistency**
   - The code was using both `user-files` (with hyphen) and `user_files` (with underscore) in different places.
   - We standardized on `user-files` to match the existing bucket configuration.

3. **"Failed to retrieve folder contents from "user-files": bucketId is required" error**
   - Created a new SQL script to fix issues with the bucket configuration and objects that might have NULL bucket_id.

## Changes Made

### SQL Scripts

1. **fix_user_files_upload.sql**
   - Updated to use `user-files` (with hyphen) consistently
   - Maintained the same validation and fix functions for file paths

2. **fix_bucket_id_issue.sql (New)**
   - Checks if the bucket exists and creates it if needed
   - Fixes any objects with NULL bucket_id
   - Deletes objects with empty names that can cause issues
   - Ensures the bucket has the correct public setting
   - Grants necessary permissions
   - Recreates the RLS policies for the bucket

### Code Changes

1. **ProfilePage.tsx**
   - Updated all references to use `user-files` consistently
   - Fixed the bucket name in the initialization code
   - Fixed the bucket name in file upload and download functions

2. **supabaseClient.ts**
   - Updated the `uploadFile` and `downloadFile` functions to use `user-files`
   - Added better error handling

3. **uploadToSupabase.ts**
   - Updated the bucket name normalization logic to use `user-files`

## How to Apply the Fix

1. Run the SQL scripts in the following order:
   ```sql
   -- First, fix the bucket ID issue
   \i fix_bucket_id_issue.sql
   
   -- Then, apply the updated storage policies
   \i fix_user_files_upload.sql
   ```

2. Deploy the updated code files:
   - src/pages/ProfilePage.tsx
   - src/utils/supabaseClient.ts
   - src/utils/uploadToSupabase.ts

## Testing

After applying these changes:

1. Verify that the `user-files` bucket exists and is accessible in the Supabase dashboard
2. Test uploading a file through the profile page
3. Verify that the file appears in the `user-files` bucket with the correct path structure
4. Test downloading a file to ensure the paths are working correctly

If you encounter any issues with existing files, you may need to run additional SQL commands to fix specific records.