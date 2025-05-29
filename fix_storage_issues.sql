-- Comprehensive fix for storage issues

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

-- 6. Check and fix the user_files table structure
DO $$
DECLARE
    table_exists BOOLEAN;
    file_path_exists BOOLEAN;
    filepath_exists BOOLEAN;
    url_exists BOOLEAN;
    name_exists BOOLEAN;
    filename_exists BOOLEAN;
    file_name_exists BOOLEAN;
    path_column_name TEXT;
    name_column_name TEXT;
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
            file_path TEXT NOT NULL,
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
        path_column_name := 'file_path';
    ELSE
        -- Check which path column exists
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

        -- Check which name column exists
        SELECT EXISTS (
            SELECT FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'user_files'
            AND column_name = 'name'
        ) INTO name_exists;

        SELECT EXISTS (
            SELECT FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'user_files'
            AND column_name = 'filename'
        ) INTO filename_exists;

        SELECT EXISTS (
            SELECT FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'user_files'
            AND column_name = 'file_name'
        ) INTO file_name_exists;

        -- Determine which path column to use
        IF file_path_exists THEN
            path_column_name := 'file_path';
            RAISE NOTICE 'Using file_path column';
        ELSIF filepath_exists THEN
            path_column_name := 'filepath';
            RAISE NOTICE 'Using filepath column';
        ELSIF url_exists THEN
            path_column_name := 'url';
            RAISE NOTICE 'Using url column';
        ELSE
            -- Add file_path column if none of the path columns exist
            ALTER TABLE public.user_files ADD COLUMN file_path TEXT;
            path_column_name := 'file_path';
            RAISE NOTICE 'Added file_path column to user_files table';
        END IF;

        -- Determine which name column to use
        IF file_name_exists THEN
            name_column_name := 'file_name';
            RAISE NOTICE 'Using file_name column';
        ELSIF filename_exists THEN
            name_column_name := 'filename';
            RAISE NOTICE 'Using filename column';
        ELSIF name_exists THEN
            name_column_name := 'name';
            RAISE NOTICE 'Using name column';
        ELSE
            name_column_name := NULL;
            RAISE NOTICE 'No file name column found';
        END IF;
    END IF;
    
    -- Store the column names for later use
    PERFORM set_config('app.path_column', path_column_name, false);
    PERFORM set_config('app.name_column', COALESCE(name_column_name, ''), false);
END $$;

-- 7. Fix any records with NULL or empty file path
DO $$
DECLARE
    path_column TEXT;
    name_column TEXT;
    update_query TEXT;
BEGIN
    -- Get the column names we detected earlier
    path_column := current_setting('app.path_column', true);
    name_column := current_setting('app.name_column', true);
    
    IF path_column IS NULL OR path_column = '' THEN
        RAISE EXCEPTION 'No path column detected in user_files table';
    END IF;
    
    -- Build the update query based on available columns
    IF name_column IS NOT NULL AND name_column != '' THEN
        -- If we have a name column, use it in the update
        update_query := format('
            UPDATE public.user_files
            SET %I = user_id || ''/'' || id || ''_'' || %I
            WHERE %I IS NULL OR %I = ''''
        ', path_column, name_column, path_column, path_column);
        
        EXECUTE update_query;
        RAISE NOTICE 'Updated % using % column', path_column, name_column;
    ELSE
        -- If we don't have a name column, use just the ID
        update_query := format('
            UPDATE public.user_files
            SET %I = user_id || ''/'' || id || ''_file''
            WHERE %I IS NULL OR %I = ''''
        ', path_column, path_column, path_column);
        
        EXECUTE update_query;
        RAISE NOTICE 'Updated % without a name column', path_column;
    END IF;
END $$;

-- Note: The \i command is a psql client command and doesn't work in SQL directly.
-- To include the simple_storage_fix.sql, you need to either:
-- 1. Copy its contents here, or
-- 2. Run it separately in the Supabase SQL Editor
-- 3. Use a client-side script to combine the files before execution
