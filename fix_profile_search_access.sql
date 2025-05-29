-- Fix for profile searching and accessing functionality

-- 1. Create the profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  branch TEXT,
  year TEXT,
  semester TEXT,
  college TEXT,
  bio TEXT,
  interests TEXT[],
  profile_picture_url TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Enable Row Level Security on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for profiles
-- First drop existing policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Then create new policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (is_public = true OR auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 4. Create the user_files table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_files (
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

-- 5. Enable Row Level Security on user_files
ALTER TABLE public.user_files ENABLE ROW LEVEL SECURITY;

-- 6. Create policies for user_files
-- First drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own files" ON public.user_files;
DROP POLICY IF EXISTS "Users can insert their own files" ON public.user_files;
DROP POLICY IF EXISTS "Users can update their own files" ON public.user_files;
DROP POLICY IF EXISTS "Users can delete their own files" ON public.user_files;

-- Then create new policies
CREATE POLICY "Users can view their own files" 
ON public.user_files 
FOR SELECT 
USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own files" 
ON public.user_files 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own files" 
ON public.user_files 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files" 
ON public.user_files 
FOR DELETE 
USING (auth.uid() = user_id);

-- 7. Create the file_shares table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.file_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID REFERENCES public.user_files(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shared_with_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(file_id, shared_with_id)
);

-- 8. Enable Row Level Security on file_shares
ALTER TABLE public.file_shares ENABLE ROW LEVEL SECURITY;

-- 9. Create policies for file_shares
-- First drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view files shared with them" ON public.file_shares;
DROP POLICY IF EXISTS "Users can share their own files" ON public.file_shares;
DROP POLICY IF EXISTS "Users can delete their own shares" ON public.file_shares;

-- Then create new policies
CREATE POLICY "Users can view files shared with them" 
ON public.file_shares 
FOR SELECT 
USING (auth.uid() = shared_with_id OR auth.uid() = owner_id);

CREATE POLICY "Users can share their own files" 
ON public.file_shares 
FOR INSERT 
WITH CHECK (
  auth.uid() = owner_id AND 
  EXISTS (
    SELECT 1 FROM public.user_files 
    WHERE id = file_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own shares" 
ON public.file_shares 
FOR DELETE 
USING (auth.uid() = owner_id);

-- 10. Create or replace the search_users function
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

-- 11. Create or replace the get_accessible_files function
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

-- 12. Create a trigger to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    username, 
    full_name, 
    branch,
    year,
    semester,
    college,
    is_public
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)), 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'branch', ''),
    COALESCE(NEW.raw_user_meta_data->>'year', ''),
    COALESCE(NEW.raw_user_meta_data->>'semester', ''),
    COALESCE(NEW.raw_user_meta_data->>'college', ''),
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if the trigger already exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END
$$;