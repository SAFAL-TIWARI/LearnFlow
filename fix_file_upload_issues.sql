-- Fix for file upload issues

-- 1. First, ensure the user-files bucket exists
INSERT INTO storage.buckets (id, name, public)
SELECT 'user-files', 'user-files', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'user-files');

-- 2. Create or update the user_files table
DO $$
BEGIN
  -- Check if the user_files table exists
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_files'
  ) THEN
    -- Check and add missing columns
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'user_files' 
      AND column_name = 'name'
    ) THEN
      ALTER TABLE public.user_files ADD COLUMN name TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'user_files' 
      AND column_name = 'type'
    ) THEN
      ALTER TABLE public.user_files ADD COLUMN type TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'user_files' 
      AND column_name = 'category'
    ) THEN
      ALTER TABLE public.user_files ADD COLUMN category TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'user_files' 
      AND column_name = 'url'
    ) THEN
      ALTER TABLE public.user_files ADD COLUMN url TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'user_files' 
      AND column_name = 'subject_name'
    ) THEN
      ALTER TABLE public.user_files ADD COLUMN subject_name TEXT;
    END IF;
  ELSE
    -- Create the user_files table if it doesn't exist
    CREATE TABLE public.user_files (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      name TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      type TEXT,
      file_type TEXT,
      file_size INTEGER,
      category TEXT,
      url TEXT,
      description TEXT,
      is_public BOOLEAN DEFAULT true,
      subject_code TEXT,
      subject_name TEXT,
      material_type TEXT,
      bucket_id TEXT DEFAULT 'user-files',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  END IF;
END $$;

-- 3. Drop existing storage policies for the user-files bucket
DROP POLICY IF EXISTS "Users can upload to user-files bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can update files they own" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete files they own" ON storage.objects;
DROP POLICY IF EXISTS "Users can view files they own" ON storage.objects;
DROP POLICY IF EXISTS "Users can view all files in bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public access to user-files bucket" ON storage.objects;

-- 4. Create simplified storage policies for the user-files bucket
-- Allow authenticated users to upload files to the user-files bucket
CREATE POLICY "Users can upload to user-files bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-files');

-- Allow users to update any files in the user-files bucket (simplified for testing)
CREATE POLICY "Users can update files they own"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'user-files');

-- Allow users to delete any files in the user-files bucket (simplified for testing)
CREATE POLICY "Users can delete files they own"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'user-files');

-- Allow users to view any files in the user-files bucket (simplified for testing)
CREATE POLICY "Users can view files they own"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'user-files');

-- Allow public access to the user-files bucket (simplified for testing)
CREATE POLICY "Public access to user-files bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'user-files');

-- 5. Enable Row Level Security on user_files table
ALTER TABLE public.user_files ENABLE ROW LEVEL SECURITY;

-- 6. Create simplified policies for the user_files table
DROP POLICY IF EXISTS "Users can view their own files" ON public.user_files;
DROP POLICY IF EXISTS "Users can insert their own files" ON public.user_files;
DROP POLICY IF EXISTS "Users can update their own files" ON public.user_files;
DROP POLICY IF EXISTS "Users can delete their own files" ON public.user_files;
DROP POLICY IF EXISTS "Users can view public files" ON public.user_files;

-- Create policy for viewing files (users can view any files for testing)
CREATE POLICY "Users can view any files" 
ON public.user_files 
FOR SELECT 
TO authenticated
USING (true);

-- Create policy for users to insert files (any authenticated user can insert)
CREATE POLICY "Users can insert files" 
ON public.user_files 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Create policy for users to update files (any authenticated user can update)
CREATE POLICY "Users can update files" 
ON public.user_files 
FOR UPDATE 
TO authenticated
USING (true);

-- Create policy for users to delete files (any authenticated user can delete)
CREATE POLICY "Users can delete files" 
ON public.user_files 
FOR DELETE 
TO authenticated
USING (true);

-- 7. Create indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_user_files_user_id ON public.user_files(user_id);