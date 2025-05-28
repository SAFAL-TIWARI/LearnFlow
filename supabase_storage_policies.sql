-- First, make sure your bucket exists (skip if you already have it)
-- INSERT INTO storage.buckets (id, name) VALUES ('user-files', 'user-files');

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

-- Allow users to view their own files
CREATE POLICY "Users can view their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-files' AND
  (
    -- Their own files
    (storage.foldername(name))[1] = auth.uid()::text OR
    -- Files shared with them (requires a join with your file_shares table)
    EXISTS (
      SELECT 1 
      FROM public.user_files f
      JOIN public.file_shares fs ON f.id = fs.file_id
      WHERE 
        f.filepath = name AND
        fs.shared_with_id = auth.uid()
    ) OR
    -- Public files
    EXISTS (
      SELECT 1 
      FROM public.user_files f
      WHERE 
        f.filepath = name AND
        f.is_public = true
    )
  )
);