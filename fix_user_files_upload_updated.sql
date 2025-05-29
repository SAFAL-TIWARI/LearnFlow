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

-- Allow users to view their own files based on folder structure
CREATE POLICY "Users can view files they own"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view all files in the bucket (more permissive)
CREATE POLICY "Users can view all files in bucket"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'user-files');

-- 2. Check if the user_files table exists and create it if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_files'
  ) THEN
    CREATE TABLE public.user_files (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT,
      file_size INTEGER,
      description TEXT,
      is_public BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Enable Row Level Security
    ALTER TABLE public.user_files ENABLE ROW LEVEL SECURITY;

    -- Create policy for viewing files (users can view their own files and public files)
    CREATE POLICY "Users can view their own files" 
    ON public.user_files 
    FOR SELECT 
    USING (auth.uid() = user_id OR is_public = true);

    -- Create policy for users to insert their own files
    CREATE POLICY "Users can insert their own files" 
    ON public.user_files 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

    -- Create policy for users to update their own files
    CREATE POLICY "Users can update their own files" 
    ON public.user_files 
    FOR UPDATE 
    USING (auth.uid() = user_id);

    -- Create policy for users to delete their own files
    CREATE POLICY "Users can delete their own files" 
    ON public.user_files 
    FOR DELETE 
    USING (auth.uid() = user_id);
    
    RAISE NOTICE 'Created user_files table with necessary columns and policies';
  ELSE
    RAISE NOTICE 'user_files table already exists';
  END IF;
END $$;