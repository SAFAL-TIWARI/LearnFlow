-- Fix for search_users function to properly include semester field

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS search_users(TEXT);

-- Create the updated function with semester field
CREATE OR REPLACE FUNCTION search_users(search_query TEXT)
RETURNS TABLE (
  id UUID,
  username TEXT,
  full_name TEXT,
  branch TEXT,
  year TEXT,
  semester TEXT,
  profile_picture_url TEXT,
  is_public BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    id,
    username,
    full_name,
    COALESCE(branch, '') as branch,
    COALESCE(year, '') as year,
    COALESCE(semester, '') as semester,
    COALESCE(profile_picture_url, '') as profile_picture_url,
    is_public,
    created_at,
    updated_at
  FROM profiles
  WHERE 
    is_public = true AND
    (
      username ILIKE '%' || search_query || '%' OR
      full_name ILIKE '%' || search_query || '%' OR
      branch ILIKE '%' || search_query || '%' OR
      semester ILIKE '%' || search_query || '%'
    )
  ORDER BY 
    CASE 
      WHEN full_name ILIKE search_query || '%' THEN 1
      WHEN username ILIKE search_query || '%' THEN 2
      ELSE 3
    END,
    full_name;
$$;

-- Verify the function exists
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'search_users';