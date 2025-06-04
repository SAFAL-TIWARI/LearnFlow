# File Upload Fix

This document provides instructions to fix the issue with files not being stored in the Supabase bucket and not showing in the user_files table when uploading from the owner profile page.

## Issue Description

When uploading files from the owner profile page, the files are not being stored in the Supabase 'user-files' bucket and are not being recorded in the 'user_files' table in the database.

## Root Causes

1. The 'user-files' bucket might not exist in Supabase storage
2. The 'user_files' table might not exist in the database
3. Storage policies might not be properly configured
4. The file upload logic in OwnerProfilePage.tsx has issues with error handling and logging

## Fix Implementation

The following changes have been made to fix the issue:

1. Created a SQL script (`fix_file_upload_issues.sql`) to:
   - Ensure the 'user-files' bucket exists
   - Create or update the 'user_files' table with all necessary columns
   - Set up proper storage policies for the bucket
   - Configure row-level security for the 'user_files' table

2. Updated the `handleFileUpload` function in OwnerProfilePage.tsx to:
   - Add better error handling
   - Add more detailed logging
   - Check if the bucket exists and create it if needed
   - Ensure the user ID is correctly retrieved

3. Updated the `fetchUserFiles` function in OwnerProfilePage.tsx to:
   - Improve error handling
   - Add fallback to storage API if database query fails
   - Automatically save files found in storage to the database

4. Created a script (`src/scripts/fix_file_upload.js`) to run the SQL fix

## How to Apply the Fix

### Option 1: Run the SQL script directly

1. Connect to your Supabase database using the SQL Editor
2. Open the `fix_file_upload_issues.sql` file
3. Run the SQL script

### Option 2: Run the JavaScript fix script

1. Make sure your environment variables are set up correctly in a `.env` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. Run the fix script:
   ```bash
   node src/scripts/fix_file_upload.js
   ```

### Option 3: Manual fix

If the above options don't work, you can manually:

1. Create the 'user-files' bucket in Supabase Storage
2. Create the 'user_files' table with the necessary columns
3. Set up the storage policies as described in the SQL script

## Verifying the Fix

After applying the fix:

1. Go to the owner profile page
2. Try uploading a file
3. Check the browser console for logs (should show successful upload)
4. Verify the file appears in the list on the page
5. Check Supabase Storage to confirm the file is in the 'user-files' bucket
6. Check the 'user_files' table to confirm the file metadata is recorded

## Troubleshooting

If issues persist:

1. Check the browser console for error messages
2. Verify that the Supabase URL and API key are correct
3. Ensure the user is properly authenticated
4. Check if the storage policies allow the authenticated user to upload files
5. Verify that the 'user_files' table has the correct structure

For further assistance, please contact the development team.