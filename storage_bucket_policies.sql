-- Storage bucket policies for user-files

-- First drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own files and public files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Allow users to view their own files and public files
CREATE POLICY "Users can view their own files and public files"
ON storage.objects FOR SELECT
USING (
  -- File is in the user-files bucket
  (bucket_id = 'user-files') 
  AND (
    -- User owns the file (path starts with their user ID)
    (auth.uid()::text = SPLIT_PART(name, '/', 1))
    OR
    -- File is public (check against user_files table)
    EXISTS (
      SELECT 1 FROM public.user_files
      WHERE file_path = name
      AND is_public = true
    )
    OR
    -- File is shared with the user
    EXISTS (
      SELECT 1 FROM public.user_files f
      JOIN public.file_shares fs ON f.id = fs.file_id
      WHERE f.file_path = name
      AND fs.shared_with_id = auth.uid()
    )
  )
);

-- Allow users to insert their own files
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
WITH CHECK (
  -- File is in the user-files bucket
  (bucket_id = 'user-files')
  -- User owns the file (path starts with their user ID)
  AND (auth.uid()::text = SPLIT_PART(name, '/', 1))
);

-- Allow users to update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
USING (
  -- File is in the user-files bucket
  (bucket_id = 'user-files')
  -- User owns the file (path starts with their user ID)
  AND (auth.uid()::text = SPLIT_PART(name, '/', 1))
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
  -- File is in the user-files bucket
  (bucket_id = 'user-files')
  -- User owns the file (path starts with their user ID)
  AND (auth.uid()::text = SPLIT_PART(name, '/', 1))
);