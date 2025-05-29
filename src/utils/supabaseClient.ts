import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Profile types
export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  branch?: string;
  year?: string;
  college?: string;
  bio?: string;
  interests?: string[];
  profile_picture_url?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// File types
export interface UserFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  description?: string;
  owner_id: string;
  owner_name?: string;
  is_public: boolean;
  created_at: string;
}

// Search for users
export async function searchUsers(query: string) {
  try {
    console.log('Searching for users with query:', query);
    
    // First, check if the search_users function exists
    const { data: functionExists, error: functionCheckError } = await supabase
      .rpc('search_users', { search_query: 'test' })
      .limit(1);
      
    if (functionCheckError) {
      console.error('Error checking search_users function:', functionCheckError);
      
      // If the RPC function doesn't exist, try a direct query as fallback
      console.log('Trying direct query as fallback...');
      const { data: directData, error: directError } = await supabase
        .from('profiles')
        .select('id, username, full_name, branch, year, college, profile_picture_url, is_public')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%,branch.ilike.%${query}%,college.ilike.%${query}%`)
        .eq('is_public', true);
        
      if (directError) {
        console.error('Error with direct query fallback:', directError);
        throw directError;
      }
      
      console.log('Direct query results:', directData);
      return directData as UserProfile[];
    }
    
    // If the function check passed, use the RPC function
    const { data, error } = await supabase
      .rpc('search_users', { search_query: query });
    
    if (error) {
      console.error('Error using search_users RPC:', error);
      throw error;
    }
    
    console.log('Search results:', data);
    return data as UserProfile[];
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}

// Get user profile by ID
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data as UserProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

// Get files accessible to the current user
export async function getAccessibleFiles(userId: string) {
  try {
    const { data, error } = await supabase
      .rpc('get_accessible_files', { user_uuid: userId });
    
    if (error) throw error;
    return data as UserFile[];
  } catch (error) {
    console.error('Error fetching accessible files:', error);
    return [];
  }
}

// Get files from a specific user that are accessible to the current user
export async function getUserFiles(ownerId: string, currentUserId: string) {
  try {
    // Get public files from the owner
    const { data: publicFiles, error: publicError } = await supabase
      .from('user_files')
      .select('*, profiles!user_files_user_id_fkey(full_name)')
      .eq('user_id', ownerId)
      .eq('is_public', true);
    
    if (publicError) throw publicError;
    
    // If the current user is the owner, get all their files
    if (ownerId === currentUserId) {
      return publicFiles.map(file => ({
        ...file,
        owner_name: file.profiles?.full_name
      })) as UserFile[];
    }
    
    // Get files specifically shared with the current user
    const { data: sharedFiles, error: sharedError } = await supabase
      .from('user_files')
      .select('*, profiles!user_files_user_id_fkey(full_name), file_shares!inner(*)')
      .eq('user_id', ownerId)
      .eq('file_shares.shared_with_id', currentUserId);
    
    if (sharedError) throw sharedError;
    
    // Combine public and shared files, removing duplicates
    const allFiles = [...publicFiles];
    
    sharedFiles.forEach(sharedFile => {
      if (!allFiles.some(file => file.id === sharedFile.id)) {
        allFiles.push(sharedFile);
      }
    });
    
    return allFiles.map(file => ({
      ...file,
      owner_name: file.profiles?.full_name
    })) as UserFile[];
  } catch (error) {
    console.error('Error fetching user files:', error);
    return [];
  }
}

// Upload a file
export async function uploadFile(
  file: File, 
  userId: string, 
  description: string = '', 
  isPublic: boolean = false
) {
  try {
    // Upload to storage
    const filePath = `${userId}/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-files')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    // Create file record in database
    const { data: fileData, error: fileError } = await supabase
      .from('user_files')
      .insert([
        {
          user_id: userId,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          description,
          is_public: isPublic
        }
      ])
      .select()
      .single();
    
    if (fileError) throw fileError;
    
    return fileData;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}

// Share a file with another user
export async function shareFile(fileId: string, ownerId: string, sharedWithId: string) {
  try {
    const { data, error } = await supabase
      .from('file_shares')
      .insert([
        {
          file_id: fileId,
          owner_id: ownerId,
          shared_with_id: sharedWithId
        }
      ]);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error sharing file:', error);
    return false;
  }
}

// Download a file
export async function downloadFile(filePath: string) {
  try {
    const { data, error } = await supabase.storage
      .from('user-files')
      .download(filePath);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error downloading file:', error);
    return null;
  }
}

// Update user profile
export async function updateUserProfile(profile: Partial<UserProfile>) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', profile.id)
      .select()
      .single();
    
    if (error) throw error;
    return data as UserProfile;
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
}

// Sync user data from users table to profiles table
export async function syncUserDataToProfile(userId: string) {
  try {
    // First get the user's email from auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      return false;
    }
    
    const email = user.email;
    if (!email) {
      console.error('User has no email');
      return false;
    }
    
    // Get user data from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('branch, year, college')
      .eq('email', email)
      .single();
      
    if (userError) {
      console.error('Error fetching user data:', userError);
      return false;
    }
    
    if (!userData) {
      console.log('No user data found in users table');
      return false;
    }
    
    // Update profile with user data
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        branch: userData.branch,
        year: userData.year,
        college: userData.college,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
      
    if (updateError) {
      console.error('Error updating profile with user data:', updateError);
      return false;
    }
    
    console.log('Successfully synced user data to profile:', updatedProfile);
    return true;
  } catch (error) {
    console.error('Error syncing user data to profile:', error);
    return false;
  }
}