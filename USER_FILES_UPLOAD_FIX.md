# User Files Upload Fix

## Issue
Files uploaded by users in the profile section were not being stored correctly in the Supabase storage bucket, resulting in the following error:
```
{
  "statusCode": "400",
  "error": "InvalidKey",
  "message": "Invalid key: "
}
```

## Root Cause
1. **Inconsistent bucket naming**: The code was using both `user-files` (with hyphen) and `user_files` (with underscore) in different places.
2. **Incorrect file path structure**: The storage path didn't match the structure expected by the storage policies. According to the policies, the path should start with the user's ID as the first folder.
3. **Missing validation**: There was no validation to ensure file paths were properly formatted before uploading.

## Fixes Implemented

### 1. SQL Changes (`fix_user_files_upload.sql`)
- Created more permissive storage policies that allow uploads to the `user_files` bucket
- Added validation to ensure file paths are not empty
- Created a function to fix existing invalid file paths

### 2. Code Changes

#### ProfilePage.tsx
- Updated the storage path structure to ensure it starts with the user ID:
  ```typescript
  const storagePath = `${userId}/${category}/${selectedSubject.code}/${fileName}`;
  ```
- Changed bucket name from `user-files` to `user_files` for consistency with SQL policies
- Updated all references to the bucket name in file upload and download functions

#### supabaseClient.ts
- Updated the `uploadFile` function to use the correct bucket name (`user_files`)
- Added better error logging for upload and database operations
- Updated the `downloadFile` function to use the correct bucket name

#### uploadToSupabase.ts
- Added logic to detect user file uploads and ensure the correct bucket name is used
- Added better error handling and logging

## How to Apply the Fix

1. Run the SQL script to update storage policies:
   ```sql
   -- Connect to your Supabase database and run:
   \i fix_user_files_upload.sql
   ```

2. Deploy the updated code files:
   - src/pages/ProfilePage.tsx
   - src/utils/supabaseClient.ts
   - src/utils/uploadToSupabase.ts

## Testing
After applying these changes, users should be able to upload files in their profile section without encountering the "InvalidKey" error. The files will be properly stored in the `user_files` bucket with a path structure that starts with the user's ID.