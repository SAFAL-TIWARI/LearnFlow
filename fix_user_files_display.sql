-- Fix for user_files table to ensure files appear correctly and only once

-- 1. First, let's check for and remove duplicate entries
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

-- 2. Add a unique constraint to prevent future duplicates
ALTER TABLE public.user_files 
ADD CONSTRAINT user_files_user_id_file_path_unique 
UNIQUE (user_id, file_path);

-- 3. Make sure all files have proper public_url values
UPDATE public.user_files
SET public_url = CASE
  WHEN file_path LIKE 'http%' THEN file_path
  ELSE 
    CASE 
      WHEN file_path LIKE '%/%' THEN 
        (SELECT COALESCE(
          (SELECT value FROM public.config WHERE key = 'SUPABASE_URL'),
          'https://your-project-ref.supabase.co'
        ) || '/storage/v1/object/public/user-files/' || file_path)
      ELSE NULL
    END
  END
WHERE public_url IS NULL OR public_url = '';

-- 4. Ensure all files have is_public set properly
UPDATE public.user_files
SET is_public = true
WHERE is_public IS NULL;

-- 5. Create an index to improve query performance
CREATE INDEX IF NOT EXISTS idx_user_files_user_id ON public.user_files(user_id);

-- 6. Create a function to get all accessible files for a user
CREATE OR REPLACE FUNCTION get_user_files(p_user_id UUID)
RETURNS SETOF public.user_files AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.user_files
  WHERE user_id = p_user_id
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create a trigger to ensure created_at and updated_at are set properly
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_files_updated_at ON public.user_files;
CREATE TRIGGER user_files_updated_at
BEFORE UPDATE ON public.user_files
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();