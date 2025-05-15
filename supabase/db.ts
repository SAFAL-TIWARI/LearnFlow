import { supabase } from './client';

// Database utilities for academic materials
export const getSubjects = async (yearId: number, semesterId: number) => {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('year_id', yearId)
    .eq('semester_id', semesterId);
  
  return { data, error };
};

export const getBranches = async () => {
  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .order('name');
  
  return { data, error };
};

export const getYears = async (branchId: number) => {
  const { data, error } = await supabase
    .from('years')
    .select('*')
    .eq('branch_id', branchId)
    .order('year_number');
  
  return { data, error };
};

export const getSemesters = async (yearId: number) => {
  const { data, error } = await supabase
    .from('semesters')
    .select('*')
    .eq('year_id', yearId)
    .order('semester_number');
  
  return { data, error };
};

export const getMaterials = async (subjectId: number) => {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .eq('subject_id', subjectId);
  
  return { data, error };
};

export const saveUserProgress = async (userId: string, materialId: number, progress: number) => {
  const { data, error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      material_id: materialId,
      progress_percentage: progress,
      last_accessed: new Date().toISOString()
    })
    .select();
  
  return { data, error };
};

export const getUserMaterials = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_materials')
    .select(`
      *,
      materials(*)
    `)
    .eq('user_id', userId);
  
  return { data, error };
};