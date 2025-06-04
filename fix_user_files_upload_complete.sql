-- Comprehensive fix for user files upload and display issues

-- 1. First, ensure the user-files bucket exists
INSERT INTO storage.buckets (id, name, public)
SELECT 'user-files', 'user-files', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'user-files');

-- 2. Update the user_files table to include necessary columns
DO $$
BEGIN
  -- Check if the user_files table exists
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_files'
  ) THEN
    -- Check if subject_code column exists, add if it doesn't
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'user_files' 
      AND column_name = 'subject_code'
    ) THEN
      ALTER TABLE public.user_files ADD COLUMN subject_code TEXT;
      RAISE NOTICE 'Added subject_code column to user_files table';
    END IF;

    -- Check if material_type column exists, add if it doesn't
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'user_files' 
      AND column_name = 'material_type'
    ) THEN
      ALTER TABLE public.user_files ADD COLUMN material_type TEXT;
      RAISE NOTICE 'Added material_type column to user_files table';
    END IF;

    -- Check if bucket_id column exists, add if it doesn't
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'user_files' 
      AND column_name = 'bucket_id'
    ) THEN
      ALTER TABLE public.user_files ADD COLUMN bucket_id TEXT DEFAULT 'user-files';
      RAISE NOTICE 'Added bucket_id column to user_files table';
    END IF;
  ELSE
    -- Create the user_files table if it doesn't exist
    CREATE TABLE public.user_files (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT,
      file_size INTEGER,
      description TEXT,
      is_public BOOLEAN DEFAULT false,
      subject_code TEXT,
      material_type TEXT,
      bucket_id TEXT DEFAULT 'user-files',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    RAISE NOTICE 'Created user_files table with all necessary columns';
  END IF;
END $$;

-- 3. Update existing records to set bucket_id if it's NULL
UPDATE public.user_files
SET bucket_id = 'user-files'
WHERE bucket_id IS NULL;

-- 4. Drop existing storage policies for the user-files bucket
DROP POLICY IF EXISTS "Users can upload to user-files bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can update files they own" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete files they own" ON storage.objects;
DROP POLICY IF EXISTS "Users can view files they own" ON storage.objects;
DROP POLICY IF EXISTS "Users can view all files in bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public access to user-files bucket" ON storage.objects;

-- 5. Create new storage policies for the user-files bucket
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
  (
    -- Files in user's own folder
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- Files in material type folders that belong to the user
    (
      array_length(storage.foldername(name), 1) >= 3 AND
      (SELECT user_id FROM public.user_files WHERE file_path = name) = auth.uid()
    )
  )
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete files they own"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-files' AND
  (
    -- Files in user's own folder
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- Files in material type folders that belong to the user
    (
      array_length(storage.foldername(name), 1) >= 3 AND
      (SELECT user_id FROM public.user_files WHERE file_path = name) = auth.uid()
    )
  )
);

-- Allow users to view their own files
CREATE POLICY "Users can view files they own"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-files' AND
  (
    -- Files in user's own folder
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- Files in material type folders that belong to the user
    (
      array_length(storage.foldername(name), 1) >= 3 AND
      (SELECT user_id FROM public.user_files WHERE file_path = name) = auth.uid()
    )
    OR
    -- Public files
    (SELECT is_public FROM public.user_files WHERE file_path = name) = true
  )
);

-- Allow public access to public files
CREATE POLICY "Public access to user-files bucket"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'user-files' AND
  (SELECT is_public FROM public.user_files WHERE file_path = name) = true
);

-- 6. Create or replace function to get all accessible files for a user
DROP FUNCTION IF EXISTS get_accessible_files(UUID);
CREATE FUNCTION get_accessible_files(user_uuid UUID)
RETURNS SETOF public.user_files AS $$
BEGIN
  RETURN QUERY
  SELECT uf.*
  FROM public.user_files uf
  WHERE 
    -- User's own files
    uf.user_id = user_uuid
    OR
    -- Public files
    uf.is_public = true
    OR
    -- Files shared with the user
    EXISTS (
      SELECT 1 FROM file_shares fs
      WHERE fs.file_id = uf.id
      AND fs.shared_with_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create or replace function to get files for a specific subject
DROP FUNCTION IF EXISTS get_subject_files(TEXT);
CREATE FUNCTION get_subject_files(subject_code_param TEXT)
RETURNS SETOF public.user_files AS $$
BEGIN
  RETURN QUERY
  SELECT uf.*
  FROM public.user_files uf
  WHERE 
    uf.subject_code = subject_code_param
    AND uf.is_public = true
  ORDER BY uf.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Enable Row Level Security on user_files table if not already enabled
ALTER TABLE public.user_files ENABLE ROW LEVEL SECURITY;

-- 9. Create or replace policies for the user_files table
DROP POLICY IF EXISTS "Users can view their own files" ON public.user_files;
DROP POLICY IF EXISTS "Users can insert their own files" ON public.user_files;
DROP POLICY IF EXISTS "Users can update their own files" ON public.user_files;
DROP POLICY IF EXISTS "Users can delete their own files" ON public.user_files;
DROP POLICY IF EXISTS "Users can view public files" ON public.user_files;

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

-- 10. Create indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_user_files_user_id ON public.user_files(user_id);
CREATE INDEX IF NOT EXISTS idx_user_files_subject_code ON public.user_files(subject_code);
CREATE INDEX IF NOT EXISTS idx_user_files_material_type ON public.user_files(material_type);
CREATE INDEX IF NOT EXISTS idx_user_files_is_public ON public.user_files(is_public);