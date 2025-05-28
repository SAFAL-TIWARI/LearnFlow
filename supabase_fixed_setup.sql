-- User Profiles Table (extends the default auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  branch TEXT,
  year TEXT,
  college TEXT,
  bio TEXT,
  interests TEXT[],
  profile_picture_url TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing profiles (everyone can view public profiles)
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (is_public = true);

-- Create policy for users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Create policy for users to insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- User Files Table
CREATE TABLE IF NOT EXISTS public.user_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  filepath TEXT NOT NULL,
  filetype TEXT,
  filesize INTEGER,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_files ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing files (users can view their own files and public files)
CREATE POLICY "Users can view their own files" 
ON public.user_files 
FOR SELECT 
USING (auth.uid() = user_id OR is_public = true);

-- Create policy for users to insert their own files
CREATE POLICY "Users can insert their own files" 
ON public.user_files 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own files
CREATE POLICY "Users can update their own files" 
ON public.user_files 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policy for users to delete their own files
CREATE POLICY "Users can delete their own files" 
ON public.user_files 
FOR DELETE 
USING (auth.uid() = user_id);

-- File Sharing Table (for sharing files with specific users)
CREATE TABLE IF NOT EXISTS public.file_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID REFERENCES public.user_files(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shared_with_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(file_id, shared_with_id)
);

-- Enable Row Level Security
ALTER TABLE public.file_shares ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing shared files
CREATE POLICY "Users can view files shared with them" 
ON public.file_shares 
FOR SELECT 
USING (auth.uid() = shared_with_id OR auth.uid() = owner_id);

-- Create policy for sharing files (only file owners can share)
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

-- Create policy for users to delete their own shares
CREATE POLICY "Users can delete their own shares" 
ON public.file_shares 
FOR DELETE 
USING (auth.uid() = owner_id);

-- Create a function to search for users
CREATE OR REPLACE FUNCTION search_users(search_query TEXT)
RETURNS SETOF profiles
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT *
  FROM profiles
  WHERE 
    is_public = true AND
    (
      username ILIKE '%' || search_query || '%' OR
      full_name ILIKE '%' || search_query || '%' OR
      branch ILIKE '%' || search_query || '%' OR
      college ILIKE '%' || search_query || '%' OR
      bio ILIKE '%' || search_query || '%' OR
      EXISTS (
        SELECT 1
        FROM unnest(interests) interest
        WHERE interest ILIKE '%' || search_query || '%'
      )
    )
  ORDER BY 
    CASE 
      WHEN full_name ILIKE search_query || '%' THEN 1
      WHEN username ILIKE search_query || '%' THEN 2
      ELSE 3
    END,
    full_name;
$$;

-- Create a function to get files shared with a user
CREATE OR REPLACE FUNCTION get_accessible_files(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  filename TEXT,
  filepath TEXT,
  filetype TEXT,
  filesize INTEGER,
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
    f.filename,
    f.filepath,
    f.filetype,
    f.filesize,
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
    f.filename,
    f.filepath,
    f.filetype,
    f.filesize,
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
    f.filename,
    f.filepath,
    f.filetype,
    f.filesize,
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