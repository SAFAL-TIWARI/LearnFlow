-- Create a function to completely delete a user and all associated data
-- This function should be run in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION delete_user()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id uuid;
    deleted_files_count integer := 0;
    deleted_profile_count integer := 0;
    deleted_user_count integer := 0;
    result json;
BEGIN
    -- Get the current authenticated user ID
    current_user_id := auth.uid();
    
    -- Check if user is authenticated
    IF current_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'User not authenticated'
        );
    END IF;

    -- Delete user files from database (this will help track what files to delete from storage)
    DELETE FROM user_files WHERE user_id = current_user_id;
    GET DIAGNOSTICS deleted_files_count = ROW_COUNT;

    -- Delete file shares where user is either the sharer or recipient
    DELETE FROM file_shares WHERE user_id = current_user_id OR shared_with_id = current_user_id;

    -- Delete user profile
    DELETE FROM profiles WHERE id = current_user_id;
    GET DIAGNOSTICS deleted_profile_count = ROW_COUNT;

    -- Delete from users table if it exists
    DELETE FROM users WHERE id = current_user_id OR email = (
        SELECT email FROM auth.users WHERE id = current_user_id
    );
    GET DIAGNOSTICS deleted_user_count = ROW_COUNT;

    -- Delete the auth user (this will cascade to related auth tables)
    DELETE FROM auth.users WHERE id = current_user_id;

    -- Return success result
    result := json_build_object(
        'success', true,
        'user_id', current_user_id,
        'deleted_files_count', deleted_files_count,
        'deleted_profile_count', deleted_profile_count,
        'deleted_user_count', deleted_user_count,
        'message', 'User account and all associated data deleted successfully'
    );

    RETURN result;

EXCEPTION
    WHEN OTHERS THEN
        -- Return error information
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'error_code', SQLSTATE
        );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;

-- Create a function to get user files for deletion (helper function)
CREATE OR REPLACE FUNCTION get_user_files_for_deletion(user_uuid uuid)
RETURNS TABLE(file_path text, bucket_name text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        uf.file_path::text,
        COALESCE(uf.bucket_id, 'user-files')::text as bucket_name
    FROM user_files uf
    WHERE uf.user_id = user_uuid;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_files_for_deletion(uuid) TO authenticated;