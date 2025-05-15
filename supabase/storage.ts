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
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(path || '');
  
  return { data, error };
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