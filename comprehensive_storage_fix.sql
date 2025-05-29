-- Comprehensive fix for storage issues

-- 1. First, check and fix the user_files table structure
DO $$
DECLARE
    table_exists BOOLEAN;
    file_path_exists BOOLEAN;
    filepath_exists BOOLEAN;
    url_exists BOOLEAN;
    file_path_column_name TEXT;
BEGIN
    -- Check if table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_files'
    ) INTO table_exists;

    IF NOT table_exists THEN
        -- Create the table if it doesn't exist
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
        file_path_column_name := 'file_path';
    ELSE
        -- Check which column exists for file path
        SELECT EXISTS (
            SELECT FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'user_files'
            AND column_name = 'file_path'
        ) INTO file_path_exists;

        SELECT EXISTS (
            SELECT FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'user_files'
            AND column_name = 'filepath'
        ) INTO filepath_exists;

        SELECT EXISTS (
            SELECT FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'user_files'
            AND column_name = 'url'
        ) INTO url_exists;

        -- Determine which column to use
        IF file_path_exists THEN
            file_path_column_name := 'file_path';
            RAISE NOTICE 'Using file_path column';
        ELSIF filepath_exists THEN
            file_path_column_name := 'filepath';
            RAISE NOTICE 'Using filepath column';
        ELSIF url_exists THEN
            file_path_column_name := 'url';
            RAISE NOTICE 'Using url column';
        ELSE
            -- Add file_path column if none of the path columns exist
            ALTER TABLE public.user_files ADD COLUMN file_path TEXT;
            file_path_column_name := 'file_path';
            RAISE NOTICE 'Added file_path column to user_files table';
        END IF;
    END IF;
    
    -- Store the column name for later use
    PERFORM set_config('app.file_path_column', file_path_column_name, false);
END $$;

-- 2. Fix the storage bucket
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
        VALUES ('user-files', 'user-files', true);
        
        RAISE NOTICE 'Created bucket user-files';
    ELSE
        -- Ensure the bucket has the correct public setting
        UPDATE storage.buckets
        SET public = true
        WHERE id = 'user-files';
        
        RAISE NOTICE 'Updated bucket user-files to be public';
    END IF;
END $$;

-- 3. Fix any objects with NULL bucket_id
UPDATE storage.objects
SET bucket_id = 'user-files'
WHERE bucket_id IS NULL
  AND name LIKE '%.%'; -- Only update files (with extensions)

-- 4. Delete any objects with empty names (these can cause issues)
DELETE FROM storage.objects
WHERE bucket_id = 'user-files' AND (name IS NULL OR name = '');

-- 5. Grant necessary permissions
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;

-- 6. Recreate the RLS policies for the bucket
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