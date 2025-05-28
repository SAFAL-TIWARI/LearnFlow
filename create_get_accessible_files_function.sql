-- Create a function to get files accessible to a user
CREATE OR REPLACE FUNCTION get_accessible_files(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  file_name TEXT,
  file_path TEXT,
  file_type TEXT,
  file_size INTEGER,
  description TEXT,
  owner_id UUID,
  owner_name TEXT,
  is_public BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    f.id,
    f.file_name,
    f.file_path,
    f.file_type,
    f.file_size,
    f.description,
    f.user_id as owner_id,
    p.full_name as owner_name,
    f.is_public,
    f.created_at
  FROM 
    public.user_files f
  JOIN 
    public.profiles p ON f.user_id = p.id
  WHERE 
    f.is_public = true
  UNION
  SELECT 
    f.id,
    f.file_name,
    f.file_path,
    f.file_type,
    f.file_size,
    f.description,
    f.user_id as owner_id,
    p.full_name as owner_name,
    f.is_public,
    f.created_at
  FROM 
    public.user_files f
  JOIN 
    public.profiles p ON f.user_id = p.id
  JOIN 
    public.file_shares fs ON f.id = fs.file_id
  WHERE 
    fs.shared_with_id = user_uuid
  UNION
  SELECT 
    f.id,
    f.file_name,
    f.file_path,
    f.file_type,
    f.file_size,
    f.description,
    f.user_id as owner_id,
    p.full_name as owner_name,
    f.is_public,
    f.created_at
  FROM 
    public.user_files f
  JOIN 
    public.profiles p ON f.user_id = p.id
  WHERE 
    f.user_id = user_uuid
  ORDER BY 
    created_at DESC;
$$;