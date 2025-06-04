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
  semester?: string;
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
  subject_code?: string;
  subject_name?: string;
  material_type?: string;
  bucket_id?: string;
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
        .select('id, username, full_name, branch, year, semester, profile_picture_url, is_public')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%,branch.ilike.%${query}%,semester.ilike.%${query}%`)
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
    console.log('Fetching profile for user ID:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
    
    console.log('Profile data retrieved:', data);
    
    // Check if profile is public or if the current user is the owner
    const { data: { user } } = await supabase.auth.getUser();
    const isPublic = data.is_public === true;
    const isOwner = user && user.id === data.id;
    
    if (!isPublic && !isOwner) {
      console.log('Profile is not public and user is not the owner');
      throw new Error('Profile is not accessible');
    }
    
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
  isPublic: boolean = false,
  subjectCode: string = '',
  materialType: string = ''
) {
  try {
    // Validate inputs
    if (!file) {
      throw new Error('File is required');
    }
    
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    // Create a properly organized file path based on material type and subject code
    let filePath = '';
    
    if (materialType && subjectCode) {
      // If both material type and subject code are provided, organize files accordingly
      // Format: [materialType]/[subjectCode]/[userId]_[timestamp]_[filename]
      filePath = `${materialType}/${subjectCode}/${userId}_${Date.now()}_${file.name}`;
    } else {
      // Default path if no material type or subject code is provided
      filePath = `${userId}/${Date.now()}_${file.name}`;
    }
    
    console.log('Uploading file to path:', filePath);
    
    // Always use the 'user-files' bucket (with hyphen)
    const bucketName = 'user-files';
    
    // Check if the bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('Error listing buckets:', bucketError);
      throw bucketError;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.error('The user-files bucket does not exist');
      throw new Error('Storage bucket not found. Please contact support.');
    }
    
    console.log(`Using bucket: ${bucketName}`);
    
    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }
    
    console.log('File uploaded successfully to storage');
    
    // Create file record in database with all necessary fields
    try {
      const fileRecord = {
        user_id: userId,
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        description,
        is_public: isPublic,
        subject_code: subjectCode || null,
        material_type: materialType || null,
        bucket_id: bucketName
      };
      
      console.log('Inserting file record into database:', fileRecord);
      
      const { data: fileData, error: fileError } = await supabase
        .from('user_files')
        .insert([fileRecord])
        .select()
        .single();
      
      if (fileError) {
        console.error('Database insert error:', fileError);
        
        // Try with a more minimal set of required columns
        console.log('First insert attempt failed, trying with minimal columns');
        const minimalRecord = {
          user_id: userId,
          file_name: file.name,
          file_path: filePath,
          is_public: isPublic,
          subject_code: subjectCode || null,
          material_type: materialType || null,
          bucket_id: bucketName
        };
        
        const { data: minimalData, error: minimalError } = await supabase
          .from('user_files')
          .insert([minimalRecord])
          .select()
          .single();
        
        if (minimalError) {
          console.error('Database insert error (minimal):', minimalError);
          throw minimalError;
        }
        
        console.log('File record created in database with minimal fields');
        return minimalData;
      }
      
      console.log('File record created in database');
      return fileData;
    } catch (dbError) {
      console.error('All database insert attempts failed:', dbError);
      
      // Even if DB insert fails, the file is still in storage
      // Return a basic object with the file path so it can still be accessed
      return {
        id: 'unknown',
        user_id: userId,
        file_path: filePath,
        file_name: file.name,
        is_public: isPublic,
        subject_code: subjectCode || null,
        material_type: materialType || null,
        bucket_id: bucketName
      };
    }
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
export async function downloadFile(filePath: string, bucketId?: string) {
  try {
    // Validate the file path
    if (!filePath || filePath.trim() === '') {
      console.error('Invalid file path: Path is empty');
      throw new Error('Invalid file path: Path is empty');
    }
    
    console.log('Downloading file from path:', filePath);
    
    // Use the provided bucket ID or default to 'user-files'
    const bucketName = bucketId || 'user-files';
    
    // Try to download from the specified bucket
    let result = await supabase.storage
      .from(bucketName)
      .download(filePath);
    
    // If that fails and we're using the default bucket, try with the underscore version
    if (result.error && !bucketId && result.error.message.includes('bucket')) {
      console.log('Trying alternate bucket name with underscore');
      result = await supabase.storage
        .from('user_files') // Try with underscore as fallback
        .download(filePath);
    }
    
    if (result.error) {
      console.error('Error downloading file:', result.error);
      
      // If the file path includes a subject code and material type, try to fetch it directly
      // This handles cases where the file might be in a different structure
      const pathParts = filePath.split('/');
      if (pathParts.length >= 3) {
        // Try to get the file info from the database
        const { data: fileData, error: fileError } = await supabase
          .from('user_files')
          .select('*')
          .eq('file_path', filePath)
          .single();
          
        if (!fileError && fileData && fileData.bucket_id) {
          console.log(`Found file in database, trying bucket: ${fileData.bucket_id}`);
          result = await supabase.storage
            .from(fileData.bucket_id)
            .download(filePath);
            
          if (result.error) {
            console.error('Error downloading file from database bucket:', result.error);
            throw result.error;
          }
        } else {
          throw result.error;
        }
      } else {
        throw result.error;
      }
    }
    
    console.log('File downloaded successfully');
    return result.data;
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
    
    // Try to get user data from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')  // Select all columns to see what's available
      .eq('email', email)
      .single();
    
    // Also get user metadata from auth
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Error fetching auth user:', authError);
    }
    
    // Prepare update data with priority to user table data, then auth metadata
    let updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    // If we have user data from the users table
    if (userData && !userError) {
      console.log('Found user data in users table:', userData);
      
      // Check for branch in users table
      if (userData.branch) {
        updateData.branch = userData.branch;
      }
      
      // Check for year in users table
      if (userData.year) {
        updateData.year = userData.year;
      }
      
      // Check for semester in users table
      if (userData.semester) {
        updateData.semester = userData.semester;
      }
      
      // Check for name in users table
      if (userData.name) {
        updateData.full_name = userData.name;
      }
    } else {
      console.log('No user data found in users table or error occurred:', userError);
    }
    
    // If we have auth metadata, use it as fallback
    if (authUser?.user?.user_metadata) {
      const metadata = authUser.user.user_metadata;
      console.log('Found auth metadata:', metadata);
      
      // Use auth metadata as fallback
      if (!updateData.branch && metadata.branch) {
        updateData.branch = metadata.branch;
      }
      
      if (!updateData.year && metadata.year) {
        updateData.year = metadata.year;
      }
      
      if (!updateData.semester && metadata.semester) {
        updateData.semester = metadata.semester;
      }
      
      if (!updateData.full_name && metadata.full_name) {
        updateData.full_name = metadata.full_name;
      }
    }
    
    // Only update if we have data to update
    if (Object.keys(updateData).length > 1) { // More than just updated_at
      console.log('Updating profile with data:', updateData);
      
      // Update profile with collected data
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();
        
      if (updateError) {
        console.error('Error updating profile with user data:', updateError);
        return false;
      }
      
      console.log('Successfully synced user data to profile:', updatedProfile);
      return true;
    } else {
      console.log('No data to update in profile');
      return false;
    }
  } catch (error) {
    console.error('Error syncing user data to profile:', error);
    return false;
  }
}