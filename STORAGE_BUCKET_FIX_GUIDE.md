# Storage Bucket Fix Guide

## Issue Summary

You're experiencing several issues with your Supabase storage:

1. **"Failed to retrieve folder contents from "user-files": bucketId is required"**
   - This error occurs when trying to list files in the storage bucket.

2. **"{"statusCode":"400","error":"InvalidKey","message":"Invalid key: "}"**
   - This error occurs when trying to download a file.

3. **"ERROR: 42703: column "file_name" does not exist"**
   - This error occurs when running SQL scripts that reference columns that don't exist in your database.

## Solution Options

You have two options to fix these issues:

### Option 1: Fix the Existing Bucket (Recommended)

This approach fixes the issues with your current `user-files` bucket without creating a new one.

#### Steps:

1. **Run the Simple SQL Fix Script**

   Connect to your Supabase database using the SQL Editor and run the `simple_storage_fix.sql` script:

   ```sql
   -- Run the simple fix script
   \i simple_storage_fix.sql
   ```

   This script will:
   - Ensure the bucket exists with the correct configuration
   - Fix any objects with NULL bucket_id
   - Delete problematic objects with empty names
   - Set up proper permissions and policies
   
   This simplified script avoids any issues with column names in your database tables.

2. **Deploy the Updated Code**

   Update the following files with the changes we've made:
   - `src/utils/supabaseClient.ts` - Improved error handling and added support for both bucket naming conventions (with hyphen or underscore)
   - `src/pages/UserFiles.tsx` - Better validation for file downloads
   - `supabase/storage.ts` - Enhanced bucket validation and error handling

3. **Test the Fix**

   After deploying the changes:
   - Try viewing the user-files bucket in the Supabase dashboard
   - Test uploading a new file
   - Test downloading an existing file

### Option 2: Create a New Bucket

If you prefer to start fresh with a new bucket, you can use this approach.

#### Steps:

1. **Create a New Bucket**

   Run the `create_new_storage_bucket.sql` script:

   ```sql
   -- Create a new bucket with proper policies
   \i create_new_storage_bucket.sql
   ```

   This will create a new bucket called `user-files-new` with all necessary policies.

2. **Update Database References**

   Run the following SQL command to update references to the old bucket:

   ```sql
   -- Update references in the database
   SELECT update_bucket_references('user-files', 'user-files-new');
   ```

3. **Update Your Code**

   Change all references from `user-files` to `user-files-new` in your code:

   ```typescript
   // Example: In supabaseClient.ts
   const { data, error } = await supabase.storage
     .from('user-files-new') // Changed from 'user-files'
     .download(filePath);
   ```

4. **Migrate Existing Files**

   You'll need to write a script to download files from the old bucket and upload them to the new one. This can't be done directly in SQL and requires application code.

5. **Test Thoroughly**

   Test all file operations with the new bucket before removing the old one.

## Troubleshooting

If you continue to experience issues after applying the fixes:

1. **Check the Console for Errors**
   - Look for specific error messages in your browser's developer console

2. **Verify Bucket Existence**
   - In the Supabase dashboard, confirm that the bucket exists and has the correct name
   - Note that our updated code now supports both `user-files` (with hyphen) and `user_files` (with underscore)

3. **Check Database Table Structure**
   - Run the following SQL to check your table structure:
     ```sql
     SELECT column_name, data_type 
     FROM information_schema.columns 
     WHERE table_schema = 'public' 
     AND table_name = 'user_files'
     ORDER BY ordinal_position;
     ```
   - Our updated code is designed to handle different column names

4. **Check File Paths**
   - Ensure file paths in your database match the actual paths in storage

5. **Test with a Simple File**
   - Try uploading and downloading a simple text file to isolate any format-specific issues

6. **Check User Permissions**
   - Verify that the authenticated user has the necessary permissions

## Need More Help?

If these solutions don't resolve your issues, you may need to:

1. Check for any custom code that might be interfering with storage operations
2. Review your Supabase project settings for any storage-related configurations
3. Consider reaching out to Supabase support with specific error details