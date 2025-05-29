-- Check the actual column names in the user_files table
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_files'
ORDER BY ordinal_position;