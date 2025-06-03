import { supabase } from '../lib/supabase'

export const uploadFile = async (file: File, path: string, bucketName: string = 'resources') => {
  // If path starts with a user ID and we're uploading to user files, use the user-files bucket
  if (path.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\//) && 
      (bucketName === 'user-files' || bucketName === 'user_files')) {
    bucketName = 'user-files'; // Ensure consistent bucket name
  }
  
  const { data, error } = await supabase.storage.from(bucketName).upload(path, file, {
    cacheControl: '3600',
    upsert: false
  })
  if (error) {
    console.error('Error uploading file to Supabase:', error);
    throw error;
  }
  return data;
}

export const getPublicUrl = (path: string, bucketName: string = 'resources') => {
  // If path starts with a user ID and we're getting from user files, use the user-files bucket
  if (path.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\//) && 
      (bucketName === 'user-files' || bucketName === 'user_files')) {
    bucketName = 'user-files'; // Ensure consistent bucket name
  }
  
  const { data } = supabase.storage.from(bucketName).getPublicUrl(path)
  return data.publicUrl;
}
