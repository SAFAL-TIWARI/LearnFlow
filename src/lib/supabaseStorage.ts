import { supabase } from './supabaseClient';

/**
 * Supabase storage bucket names
 */
export const STORAGE_BUCKETS = {
  RESOURCES: 'resources',
  USER_FILES: 'user-files'
};

/**
 * Folder paths within the storage bucket
 */
export const STORAGE_FOLDERS = {
  ACADEMIC: 'academic',
  PROFILE_PICTURES: 'profile-pictures',
  USER_FILES: 'user-files'
};

/**
 * Material types that match the structure in academicData.ts
 */
export const MATERIAL_TYPES = [
  'syllabus',
  'assignments',
  'practicals',
  'labwork',
  'pyq'
];



/**
 * Checks if a storage bucket exists
 */
export const checkBucketExists = async (bucketName: string) => {
  try {
    if (!bucketName) {
      console.error('Error: bucketName is required');
      return { exists: false, error: new Error('bucketName is required') };
    }
    
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('Error listing buckets:', listError);
      return { exists: false, error: listError };
    }
    
    const exists = buckets?.some(bucket => bucket.name === bucketName);
    return { exists, error: null };
  } catch (error) {
    console.error('Error checking bucket existence:', error);
    return { exists: false, error };
  }
};

/**
 * Creates the storage buckets if they don't exist
 */
export const createStorageBuckets = async () => {
  try {
    // Check if buckets exist
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('Error listing buckets:', listError);
      return { error: listError };
    }

    const results = [];

    // Create resources bucket if it doesn't exist
    const resourcesBucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKETS.RESOURCES);
    if (!resourcesBucketExists) {
      const { data, error } = await supabase.storage.createBucket(STORAGE_BUCKETS.RESOURCES, {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024 // 10MB limit to conserve space
      });

      if (error) {
        console.error(`Error creating bucket '${STORAGE_BUCKETS.RESOURCES}':`, error);
        results.push({ bucketName: STORAGE_BUCKETS.RESOURCES, success: false, error });
      } else {
        console.log(`Created bucket: '${STORAGE_BUCKETS.RESOURCES}'`);
        results.push({ bucketName: STORAGE_BUCKETS.RESOURCES, success: true, exists: false });
      }
    } else {
      console.log(`Bucket '${STORAGE_BUCKETS.RESOURCES}' already exists.`);
      results.push({ bucketName: STORAGE_BUCKETS.RESOURCES, success: true, exists: true });
    }

    // Create user-files bucket if it doesn't exist
    const userFilesBucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKETS.USER_FILES);
    if (!userFilesBucketExists) {
      const { data, error } = await supabase.storage.createBucket(STORAGE_BUCKETS.USER_FILES, {
        public: true,
        fileSizeLimit: 50 * 1024 * 1024 // 50MB limit for user files
      });

      if (error) {
        console.error(`Error creating bucket '${STORAGE_BUCKETS.USER_FILES}':`, error);
        results.push({ bucketName: STORAGE_BUCKETS.USER_FILES, success: false, error });
      } else {
        console.log(`Created bucket: '${STORAGE_BUCKETS.USER_FILES}'`);
        results.push({ bucketName: STORAGE_BUCKETS.USER_FILES, success: true, exists: false });
      }
    } else {
      console.log(`Bucket '${STORAGE_BUCKETS.USER_FILES}' already exists.`);
      results.push({ bucketName: STORAGE_BUCKETS.USER_FILES, success: true, exists: true });
    }

    // Check if any bucket creation failed
    const anyFailed = results.some(result => !result.success);
    
    return { 
      data: results, 
      error: anyFailed ? new Error('One or more buckets failed to create') : null 
    };
  } catch (error) {
    console.error('Error creating storage buckets:', error);
    return { error };
  }
};



/**
 * Gets the public URL for a file in the Supabase storage bucket
 */
export const getPublicUrl = (filePath: string, bucketName: string = STORAGE_BUCKETS.RESOURCES) => {
  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return data.publicUrl;
};

/**
 * Lists files in a folder in the Supabase storage bucket
 */
export const listFiles = async (folderPath: string, bucketName: string = STORAGE_BUCKETS.RESOURCES) => {
  try {
    // Validate bucket name is provided
    if (!bucketName) {
      console.error('Error: bucketId is required for listing files');
      return { data: null, error: new Error('bucketId is required') };
    }

    // Ensure folderPath is a string (empty string is valid for root folder)
    const path = folderPath || '';
    
    console.log(`Listing files in bucket: ${bucketName}, folder: ${path}`);
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(path);

    if (error) {
      console.error(`Error listing files in ${bucketName}/${path}:`, error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in listFiles:', error);
    return { data: null, error };
  }
};

/**
 * Downloads a file from the Supabase storage bucket
 */
export const downloadFile = async (filePath: string, bucketName: string = STORAGE_BUCKETS.RESOURCES) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filePath);

    if (error) {
      console.error(`Error downloading file from ${bucketName}/${filePath}:`, error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in downloadFile:', error);
    return { data: null, error };
  }
};

/**
 * Deletes a file from the Supabase storage bucket
 */
export const deleteFile = async (filePath: string, bucketName: string = STORAGE_BUCKETS.RESOURCES) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error(`Error deleting file from ${bucketName}/${filePath}:`, error);
      return { error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in deleteFile:', error);
    return { error };
  }
};

