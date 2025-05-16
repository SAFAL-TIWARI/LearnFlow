import { supabase } from './supabaseClient';
import { FileResource } from '../data/academicData';

/**
 * Supabase storage bucket name (single bucket for free plan)
 */
export const STORAGE_BUCKET = 'resources';

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
 * File type mapping based on extension
 */
export const FILE_TYPE_MAP: Record<string, FileResource['type']> = {
  'pdf': 'pdf',
  'doc': 'doc',
  'docx': 'doc',
  'ppt': 'ppt',
  'pptx': 'ppt',
  'xls': 'xlsx',
  'xlsx': 'xlsx',
  'zip': 'zip',
  'rar': 'zip',
  'jpg': 'image',
  'jpeg': 'image',
  'png': 'image',
  'gif': 'image',
  'txt': 'other',
  'csv': 'other'
};

/**
 * Creates the storage bucket if it doesn't exist
 */
export const createStorageBucket = async () => {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('Error listing buckets:', listError);
      return { error: listError };
    }

    const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKET);

    if (bucketExists) {
      console.log(`Bucket '${STORAGE_BUCKET}' already exists.`);
      return { data: { bucketName: STORAGE_BUCKET, exists: true }, error: null };
    }

    // Create bucket
    const { data, error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024 // 10MB limit to conserve space
    });

    if (error) {
      console.error(`Error creating bucket '${STORAGE_BUCKET}':`, error);
      return { error };
    }

    console.log(`Created bucket: '${STORAGE_BUCKET}'`);
    return { data: { bucketName: STORAGE_BUCKET, exists: false }, error: null };
  } catch (error) {
    console.error('Error creating storage bucket:', error);
    return { error };
  }
};

/**
 * Uploads a file to the Supabase storage bucket
 */
export const uploadFile = async (
  folderPath: string,
  file: File,
  options?: { upsert?: boolean }
) => {
  try {
    const filePath = `${folderPath}/${file.name}`;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        upsert: options?.upsert || false,
        cacheControl: '3600'
      });

    if (error) {
      console.error(`Error uploading file to ${STORAGE_BUCKET}/${filePath}:`, error);
      return { data: null, error };
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return {
      data: {
        ...data,
        publicUrl: urlData.publicUrl
      },
      error: null
    };
  } catch (error) {
    console.error('Error in uploadFile:', error);
    return { data: null, error };
  }
};

/**
 * Gets the public URL for a file in the Supabase storage bucket
 */
export const getPublicUrl = (filePath: string) => {
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
};

/**
 * Lists files in a folder in the Supabase storage bucket
 */
export const listFiles = async (folderPath: string) => {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(folderPath);

    if (error) {
      console.error(`Error listing files in ${STORAGE_BUCKET}/${folderPath}:`, error);
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
export const downloadFile = async (filePath: string) => {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(filePath);

    if (error) {
      console.error(`Error downloading file from ${STORAGE_BUCKET}/${filePath}:`, error);
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
export const deleteFile = async (filePath: string) => {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error(`Error deleting file from ${STORAGE_BUCKET}/${filePath}:`, error);
      return { error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in deleteFile:', error);
    return { error };
  }
};

/**
 * Uploads a study material file and stores its metadata
 */
export const uploadStudyMaterial = async (
  subjectCode: string,
  materialType: string,
  file: File,
  title: string,
  description: string
) => {
  // 1. Upload file to storage
  const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
  const folderPath = `${STORAGE_FOLDERS.ACADEMIC}/${subjectCode}/${materialType}`;
  const filePath = `${folderPath}/${fileName}`;

  // Create folder if it doesn't exist (by uploading an empty placeholder file)
  try {
    await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(`${folderPath}/.keep`, new Uint8Array(0), {
        contentType: 'text/plain',
        upsert: true
      });
  } catch (error) {
    // Ignore errors if folder already exists
  }

  // Upload the actual file
  const { data: fileData, error: fileError } = await uploadFile(folderPath, file, { upsert: true });

  if (fileError) return { error: fileError };

  // 2. Store metadata in database
  const { data, error } = await supabase
    .from('materials')
    .insert({
      subject_id: subjectCode,
      title: title,
      description: description,
      file_path: filePath,
      type: materialType,
      created_at: new Date().toISOString()
    })
    .select();

  return { data, error };
};