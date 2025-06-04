-- Fix for user_files deletion issue
-- This script creates a trigger function to handle file deletion from storage when a row is deleted from user_files

-- First, create the function to delete files from storage
CREATE OR REPLACE FUNCTION storage.delete_file(bucket_id text, file_path text)
RETURNS void AS $$
BEGIN
  -- Delete the file from storage.objects
  DELETE FROM storage.objects
  WHERE bucket_id = $1 AND name = $2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION storage.delete_file TO authenticated;

-- Create a trigger function to handle file deletion when a row is deleted from user_files
CREATE OR REPLACE FUNCTION handle_user_file_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the file_path and bucket_id exist
  IF OLD.file_path IS NOT NULL THEN
    -- Determine the bucket_id
    DECLARE
      bucket text;
    BEGIN
      -- Use the bucket_id from the record if it exists, otherwise default to 'user-files'
      bucket := COALESCE(OLD.bucket_id, 'user-files');
      
      -- Call the storage.delete_file function to delete the file
      PERFORM storage.delete_file(bucket, OLD.file_path);
      
      RAISE NOTICE 'Deleted file from storage: bucket=%, path=%', bucket, OLD.file_path;
    END;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if the trigger already exists and drop it if it does
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'user_files_delete_trigger'
  ) THEN
    DROP TRIGGER IF EXISTS user_files_delete_trigger ON public.user_files;
  END IF;
END $$;

-- Create the trigger on the user_files table
CREATE TRIGGER user_files_delete_trigger
AFTER DELETE ON public.user_files
FOR EACH ROW
EXECUTE FUNCTION handle_user_file_delete();

-- Notify that the fix has been applied
DO $$
BEGIN
  RAISE NOTICE 'User files delete functionality has been fixed. You can now delete rows from the user_files table.';
END $$;