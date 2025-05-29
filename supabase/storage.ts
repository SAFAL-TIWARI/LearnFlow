import { supabase } from './client';

// Storage utilities
export const uploadFile = async (
  bucket: string,
  filePath: string,
  file: File,
  options?: { upsert?: boolean }
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { upsert: options?.upsert || false });
  
  return { data, error };
};

export const getFileUrl = (bucket: string, filePath: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
};

export const downloadFile = async (bucket: string, filePath: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(filePath);
  
  return { data, error };
};

export const deleteFile = async (bucket: string, filePath: string) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);
  
  return { error };
};

export const listFiles = async (bucket: string, path?: string) => {
  // Validate bucket name
  if (!bucket || bucket.trim() === '') {
    console.error('Bucket name is required');
    return { data: null, error: new Error('Bucket name is required') };
  }
  
  // Normalize bucket name to use hyphen
  const normalizedBucket = bucket === 'user_files' ? 'user-files' : bucket;
  
  try {
    // Check if bucket exists first
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('Error listing buckets:', bucketError);
      return { data: null, error: bucketError };
    }
    
    const bucketExists = buckets.some(b => b.name === normalizedBucket);
    
    if (!bucketExists) {
      console.error(`Bucket "${normalizedBucket}" does not exist`);
      return { data: null, error: new Error(`Bucket "${normalizedBucket}" does not exist`) };
    }
    
    // List files in the bucket
    const { data, error } = await supabase.storage
      .from(normalizedBucket)
      .list(path || '');
    
    if (error) {
      console.error('Error listing files:', error);
    }
    
    return { data, error };
  } catch (error) {
    console.error('Unexpected error listing files:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};

export const uploadStudyMaterial = async (
  subjectId: number,
  materialType: string,
  file: File,
  title: string,
  description: string
) => {
  // 1. Upload file to storage
  const fileName = `${Date.now()}_${file.name}`;
  const filePath = `subjects/${subjectId}/${materialType}/${fileName}`;
  
  const { data: fileData, error: fileError } = await uploadFile('materials', filePath, file);
  
  if (fileError) return { error: fileError };
  
  // 2. Store metadata in database
  const { data, error } = await supabase
    .from('materials')
    .insert({
      subject_id: subjectId,
      title: title,
      description: description,
      file_path: filePath,
      type: materialType,
      created_at: new Date().toISOString()
    })
    .select();
  
  return { data, error };
};