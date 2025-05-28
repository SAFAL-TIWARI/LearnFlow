-- Drop the table if it exists (be careful with this in production!)
DROP TABLE IF EXISTS public.user_files CASCADE;

-- Create the user_files table with consistent column names
CREATE TABLE public.user_files (
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