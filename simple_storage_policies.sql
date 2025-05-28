-- Simple storage policies that don't rely on database joins

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload their own files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update and delete their own files
CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view files in the bucket
-- This is a simplified policy that allows users to view any file
-- You can refine this later based on your actual database structure
CREATE POLICY "Users can view files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-files'
);