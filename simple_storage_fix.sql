-- Simple storage fix that works regardless of column names

-- 1. First, ensure the bucket exists and has the correct configuration
DO $$
DECLARE
    bucket_exists BOOLEAN;
BEGIN
    -- Check if bucket exists
    SELECT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'user-files'
    ) INTO bucket_exists;

    IF NOT bucket_exists THEN
        -- Create the bucket if it doesn't exist
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('user-files', 'user-files', false);
        
        RAISE NOTICE 'Created bucket user-files';
    ELSE
        -- Update the bucket to ensure correct configuration
        UPDATE storage.buckets
        SET name = 'user-files'
        WHERE id = 'user-files';
        
        RAISE NOTICE 'Updated bucket user-files configuration';
    END IF;
END $$;

-- 2. Fix any objects with NULL bucket_id
UPDATE storage.objects
SET bucket_id = 'user-files'
WHERE bucket_id IS NULL
  AND name LIKE '%.%'; -- Only update files (with extensions)

-- 3. Delete any objects with empty names (these can cause issues)
DELETE FROM storage.objects
WHERE bucket_id = 'user-files' AND (name IS NULL OR name = '');

-- 4. Grant necessary permissions
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;

-- 5. Recreate the RLS policies for the bucket
DROP POLICY IF EXISTS "Users can upload to user-files bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can update files they own" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete files they own" ON storage.objects;
DROP POLICY IF EXISTS "Users can view files they own" ON storage.objects;
DROP POLICY IF EXISTS "Users can view public files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view files shared with them" ON storage.objects;
DROP POLICY IF EXISTS "Users can view all files in bucket" ON storage.objects;

-- Allow authenticated users to upload files to the user-files bucket
CREATE POLICY "Users can upload to user-files bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-files');

-- Allow users to view all files in the bucket (more permissive)
CREATE POLICY "Users can view all files in bucket"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'user-files');

-- Allow users to update their own files based on folder structure
CREATE POLICY "Users can update files they own"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files based on folder structure
CREATE POLICY "Users can delete files they own"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);