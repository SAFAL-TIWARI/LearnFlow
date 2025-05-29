-- Fix for "bucketId is required" error

-- First, check if the bucket exists
DO $$
DECLARE
    bucket_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'user-files'
    ) INTO bucket_exists;

    IF NOT bucket_exists THEN
        -- Create the bucket if it doesn't exist
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('user-files', 'user-files', true);
        
        RAISE NOTICE 'Created bucket user-files';
    ELSE
        RAISE NOTICE 'Bucket user-files already exists';
    END IF;
END $$;

-- Fix any objects with NULL bucket_id
UPDATE storage.objects
SET bucket_id = 'user-files'
WHERE bucket_id IS NULL
  AND name LIKE '%.%'; -- Only update files (with extensions)

-- Check for any objects with invalid paths
SELECT id, name, bucket_id
FROM storage.objects
WHERE bucket_id = 'user-files' AND name = '';

-- Delete any objects with empty names (these can cause issues)
DELETE FROM storage.objects
WHERE bucket_id = 'user-files' AND (name IS NULL OR name = '');

-- Ensure the bucket has the correct public setting
UPDATE storage.buckets
SET public = true
WHERE id = 'user-files';

-- Grant necessary permissions
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;

-- Recreate the RLS policies for the bucket
DROP POLICY IF EXISTS "Users can upload to user-files bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can update files they own" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete files they own" ON storage.objects;
DROP POLICY IF EXISTS "Users can view files they own" ON storage.objects;
DROP POLICY IF EXISTS "Users can view public files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view files shared with them" ON storage.objects;

-- Allow authenticated users to upload files to the user-files bucket
CREATE POLICY "Users can upload to user-files bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-files');

-- Allow users to view their own files
CREATE POLICY "Users can view files they own"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view public files
CREATE POLICY "Users can view public files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-files' AND
  EXISTS (
    SELECT 1 
    FROM public.user_files
    WHERE 
      file_path = name AND
      is_public = true
  )
);

-- Allow users to update their own files
CREATE POLICY "Users can update files they own"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete files they own"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);