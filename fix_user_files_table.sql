-- Fix user_files table structure

-- First, check if the table exists
DO $$
DECLARE
    table_exists BOOLEAN;
    file_path_exists BOOLEAN;
    filepath_exists BOOLEAN;
    url_exists BOOLEAN;
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

        -- Add file_path column if none of the path columns exist
        IF NOT file_path_exists AND NOT filepath_exists AND NOT url_exists THEN
            ALTER TABLE public.user_files ADD COLUMN file_path TEXT;
            RAISE NOTICE 'Added file_path column to user_files table';
        END IF;

        -- If filepath exists but file_path doesn't, create a view to map between them
        IF filepath_exists AND NOT file_path_exists THEN
            RAISE NOTICE 'Using filepath column instead of file_path';
            
            -- Create a view that maps filepath to file_path
            CREATE OR REPLACE VIEW user_files_view AS
            SELECT 
                id,
                user_id,
                file_name,
                filepath AS file_path,
                file_type,
                file_size,
                description,
                is_public,
                created_at,
                updated_at
            FROM public.user_files;
        END IF;

        -- If url exists but file_path doesn't, create a view to map between them
        IF url_exists AND NOT file_path_exists THEN
            RAISE NOTICE 'Using url column instead of file_path';
            
            -- Create a view that maps url to file_path
            CREATE OR REPLACE VIEW user_files_view AS
            SELECT 
                id,
                user_id,
                file_name,
                url AS file_path,
                file_type,
                file_size,
                description,
                is_public,
                created_at,
                updated_at
            FROM public.user_files;
        END IF;
    END IF;
END $$;