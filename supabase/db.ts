import { supabase } from './client'

export const getResources = async () => {
  const { data, error } = await supabase.from('resources').select('*')
  if (error) throw error
  return data
}

export const addResource = async (resource: any) => {
  const { data, error } = await supabase.from('resources').insert([resource])
  if (error) throw error
  return data
}
