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
      filepath = name AND
      is_public = true
  )
);

-- Allow users to view files shared with them
CREATE POLICY "Users can view files shared with them"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-files' AND
  EXISTS (
    SELECT 1 
    FROM public.file_shares fs
    JOIN public.user_files uf ON fs.file_id = uf.id
    WHERE 
      uf.filepath = name AND
      fs.shared_with_id = auth.uid()
  )
);