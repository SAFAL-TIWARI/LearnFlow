import { supabase } from '@/lib/supabaseClient'

export const uploadFile = async (file: File, path: string, bucketName: string = 'resources') => {
  const { data, error } = await supabase.storage.from(bucketName).upload(path, file, {
    cacheControl: '3600',
    upsert: false
  })
  if (error) throw error
  return data
}

export const getPublicUrl = (path: string, bucketName: string = 'resources') => {
  const { data } = supabase.storage.from(bucketName).getPublicUrl(path)
  return data.publicUrl
}
