import { supabase } from './client'

export const uploadToStorage = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file)
  if (error) throw error
  return data
}

export const getPublicURL = (bucket: string, path: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
