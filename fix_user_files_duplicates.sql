-- Fix for user_files table to ensure files appear correctly and only once

-- 1. Find and remove duplicate files based on user_id and file_path
-- This query will identify duplicates and keep only one copy
WITH duplicates AS (
    SELECT 
        file_path,
        user_id,
        COUNT(*) as count,
        MIN(id) as keep_id
    FROM 
        public.user_files
    GROUP BY 
        file_path, user_id
    HAVING 
        COUNT(*) > 1
)
DELETE FROM public.user_files
WHERE id IN (
    SELECT uf.id 
    FROM public.user_files uf
    JOIN duplicates d ON uf.file_path = d.file_path AND uf.user_id = d.user_id
    WHERE uf.id != d.keep_id
);

-- 2. Try to add a unique constraint to prevent future duplicates
-- If this fails, you can skip this step
ALTER TABLE public.user_files 
ADD CONSTRAINT user_files_user_id_file_path_unique 
UNIQUE (user_id, file_path);

-- 3. Make sure all files have is_public set properly
UPDATE public.user_files
SET is_public = true
WHERE is_public IS NULL;

-- 4. Create an index to improve query performance
CREATE INDEX IF NOT EXISTS idx_user_files_user_id ON public.user_files(user_id);

-- 5. Add a public_url column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_files'
        AND column_name = 'public_url'
    ) THEN
        ALTER TABLE public.user_files ADD COLUMN public_url TEXT;
    END IF;
END $$;

-- 6. Update public_url values where missing
UPDATE public.user_files
SET public_url = 'https://your-project-ref.supabase.co/storage/v1/object/public/user-files/' || file_path
WHERE (public_url IS NULL OR public_url = '')
AND file_path IS NOT NULL
AND file_path != '';