-- First, check the actual column names in the user_files table
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_files'
ORDER BY ordinal_position;

-- Then, based on the actual column names, we'll fix the duplicates and other issues
-- The script below uses placeholders that you should replace with the actual column names
-- from your table after running the query above

-- 1. First, let's check for and remove duplicate entries
-- Replace 'file_path_column' with the actual column name that stores the file path
-- Replace 'user_id_column' with the actual column name that stores the user ID
WITH duplicates AS (
  SELECT 
    file_path_column,
    user_id_column,
    COUNT(*) as count,
    MIN(id) as keep_id
  FROM 
    public.user_files
  GROUP BY 
    file_path_column, user_id_column
  HAVING 
    COUNT(*) > 1
)
DELETE FROM public.user_files
WHERE id IN (
  SELECT uf.id 
  FROM public.user_files uf
  JOIN duplicates d ON uf.file_path_column = d.file_path_column AND uf.user_id_column = d.user_id_column
  WHERE uf.id != d.keep_id
);

-- 2. Add a unique constraint to prevent future duplicates
-- Replace 'file_path_column' and 'user_id_column' with the actual column names
ALTER TABLE public.user_files 
ADD CONSTRAINT user_files_user_path_unique 
UNIQUE (user_id_column, file_path_column);

-- 3. Make sure all files have proper public_url values
-- Replace 'public_url_column', 'file_path_column' with the actual column names
UPDATE public.user_files
SET public_url_column = CASE
  WHEN file_path_column LIKE 'http%' THEN file_path_column
  ELSE 
    CASE 
      WHEN file_path_column LIKE '%/%' THEN 
        (SELECT COALESCE(
          (SELECT value FROM public.config WHERE key = 'SUPABASE_URL'),
          'https://your-project-ref.supabase.co'
        ) || '/storage/v1/object/public/user-files/' || file_path_column)
      ELSE NULL
    END
  END
WHERE public_url_column IS NULL OR public_url_column = '';

-- 4. Ensure all files have is_public set properly
-- Replace 'is_public_column' with the actual column name
UPDATE public.user_files
SET is_public_column = true
WHERE is_public_column IS NULL;

-- 5. Create an index to improve query performance
-- Replace 'user_id_column' with the actual column name
CREATE INDEX IF NOT EXISTS idx_user_files_user_id ON public.user_files(user_id_column);

-- 6. Create a function to get all accessible files for a user
-- Replace column names in the function with the actual column names from your table
CREATE OR REPLACE FUNCTION get_user_files(p_user_id UUID)
RETURNS SETOF public.user_files AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.user_files
  WHERE user_id_column = p_user_id
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create a trigger to ensure created_at and updated_at are set properly
-- Make sure your table has these columns before adding this trigger
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