-- Fix for user files upload issue

-- 1. First, update the storage policies to allow uploads to the user-files bucket
-- This is a more permissive policy that doesn't strictly enforce the folder structure
-- but still maintains security by checking user authentication

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view public files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view files shared with them" ON storage.objects;

-- Create a bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'user-files', 'user-files', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'user-files');

-- Allow authenticated users to upload files to the user-files bucket
CREATE POLICY "Users can upload to user-files bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-files');

-- Allow users to update their own files
CREATE POLICY "Users can update files they own"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-files' AND
  EXISTS (
    SELECT 1 
    FROM public.user_files
    WHERE 
      file_path = name AND
      user_id = auth.uid()
  )
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete files they own"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-files' AND
  EXISTS (
    SELECT 1 
    FROM public.user_files
    WHERE 
      file_path = name AND
      user_id = auth.uid()
  )
);

-- Allow users to view their own files
CREATE POLICY "Users can view files they own"
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
      user_id = auth.uid()
  )
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
      uf.file_path = name AND
      fs.shared_with_id = auth.uid()
  )
);

-- 2. Update the user_files table to ensure consistency between file_path and storage path

-- Add a trigger to ensure file_path is always valid
CREATE OR REPLACE FUNCTION public.validate_file_path()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure file_path is not empty
  IF NEW.file_path IS NULL OR NEW.file_path = '' THEN
    RAISE EXCEPTION 'file_path cannot be empty';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for the validation
DROP TRIGGER IF EXISTS validate_file_path_trigger ON public.user_files;
CREATE TRIGGER validate_file_path_trigger
BEFORE INSERT OR UPDATE ON public.user_files
FOR EACH ROW
EXECUTE FUNCTION public.validate_file_path();

-- 3. Create a function to fix existing invalid file paths
CREATE OR REPLACE FUNCTION public.fix_invalid_file_paths()
RETURNS void AS $$
DECLARE
  file_record RECORD;
BEGIN
  FOR file_record IN 
    SELECT id, user_id, file_path 
    FROM public.user_files 
    WHERE file_path IS NULL OR file_path = ''
  LOOP
    -- Update with a valid path using user_id and file id as fallback
    UPDATE public.user_files
    SET file_path = file_record.user_id || '/' || file_record.id
    WHERE id = file_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to fix existing records
SELECT public.fix_invalid_file_paths();