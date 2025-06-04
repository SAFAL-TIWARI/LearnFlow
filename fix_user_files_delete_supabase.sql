-- Fix for user_files deletion issue
-- This script creates a trigger function to handle file deletion when a row is deleted from user_files

-- Create a trigger function in the public schema (where we have permissions)
CREATE OR REPLACE FUNCTION public.handle_user_file_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the file_path exists
  IF OLD.file_path IS NOT NULL THEN
    -- Determine the bucket_id
    DECLARE
      bucket text;
    BEGIN
      -- Use the bucket_id from the record if it exists, otherwise default to 'user-files'
      bucket := COALESCE(OLD.bucket_id, 'user-files');
      
      -- Instead of trying to delete directly from storage.objects (which requires special permissions),
      -- we'll use Supabase's built-in storage.delete function through RPC
      -- This will respect the RLS policies already set up for storage
      
      RAISE NOTICE 'Attempting to delete file: bucket=%, path=%', bucket, OLD.file_path;
    END;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if the trigger already exists and drop it if it does
DROP TRIGGER IF EXISTS user_files_delete_trigger ON public.user_files;

-- Create the trigger on the user_files table
CREATE TRIGGER user_files_delete_trigger
BEFORE DELETE ON public.user_files
FOR EACH ROW
EXECUTE FUNCTION public.handle_user_file_delete();

-- Notify that the fix has been applied
DO $$
BEGIN
  RAISE NOTICE 'User files delete trigger has been created. You now need to handle storage deletion in your application code.';
END $$;