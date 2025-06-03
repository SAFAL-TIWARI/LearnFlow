import { supabase } from './supabaseClient';
import { FileResource, SubjectMaterials } from '../data/academicData';
import {
  STORAGE_BUCKETS,
  STORAGE_FOLDERS,
  MATERIAL_TYPES,
  getPublicUrl
} from './supabaseStorage';

/**
 * Converts a Supabase storage file to a FileResource object
 */
export const storageFileToResource = (
  file: any,
  subjectCode: string,
  materialType: string
): FileResource => {
  // Generate file path
  const filePath = `${STORAGE_FOLDERS.ACADEMIC}/${subjectCode}/${materialType}/${file.name}`;

  // Generate public URL
  const publicUrl = getPublicUrl(filePath);

  return {
    id: `storage_${subjectCode}_${materialType}_${file.name}`,
    name: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "), // Remove extension and replace underscores with spaces
    url: publicUrl,
    downloadUrl: publicUrl
  };
};

/**
 * Fetches files for a specific subject and material type from Supabase storage
 */
export const fetchSubjectMaterialFiles = async (
  subjectCode: string,
  materialType: string
): Promise<FileResource[]> => {
  try {
    const folderPath = `${STORAGE_FOLDERS.ACADEMIC}/${subjectCode}/${materialType}`;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.RESOURCES)
      .list(folderPath);

    if (error || !data) {
      console.error(`Error fetching ${materialType} for ${subjectCode}:`, error);
      return [];
    }

    // Filter out folders and placeholder files
    const files = data.filter(item =>
      !item.id.endsWith('/') &&
      item.name !== '.keep' &&
      !item.name.startsWith('.')
    );

    // Convert to FileResource objects
    return files.map(file =>
      storageFileToResource(file, subjectCode, materialType)
    );
  } catch (error) {
    console.error(`Error in fetchSubjectMaterialFiles for ${subjectCode}/${materialType}:`, error);
    return [];
  }
};

/**
 * Fetches all materials for a subject from Supabase storage
 */
export const fetchAllSubjectMaterials = async (
  subjectCode: string
): Promise<SubjectMaterials> => {
  try {
    // Initialize empty materials object
    const materials: SubjectMaterials = {
      Syllabus: [],
      assignments: [],
      practicals: [],
      labwork: [],
      pyq: []
    };

    // Fetch files for each material type
    await Promise.all(
      MATERIAL_TYPES.map(async (type) => {
        const files = await fetchSubjectMaterialFiles(subjectCode, type);

        // Map 'syllabus' to 'Syllabus' to match academicData.ts structure
        const key = type === 'syllabus' ? 'Syllabus' : type;
        materials[key as keyof SubjectMaterials] = files;
      })
    );

    return materials;
  } catch (error) {
    console.error(`Error in fetchAllSubjectMaterials for ${subjectCode}:`, error);
    return {
      Syllabus: [],
      assignments: [],
      practicals: [],
      labwork: [],
      pyq: []
    };
  }
};

/**
 * Merges materials from Supabase storage with manually defined materials
 */
export const mergeSubjectMaterials = async (
  subjectCode: string,
  manualMaterials: SubjectMaterials
): Promise<SubjectMaterials> => {
  try {
    // Fetch materials from storage
    const storageMaterials = await fetchAllSubjectMaterials(subjectCode);

    // Merge materials
    const mergedMaterials: SubjectMaterials = {
      Syllabus: [...manualMaterials.Syllabus, ...storageMaterials.Syllabus],
      assignments: [...manualMaterials.assignments, ...storageMaterials.assignments],
      practicals: [...manualMaterials.practicals, ...storageMaterials.practicals],
      labwork: [...manualMaterials.labwork, ...storageMaterials.labwork],
      pyq: [...manualMaterials.pyq, ...storageMaterials.pyq]
    };

    return mergedMaterials;
  } catch (error) {
    console.error(`Error in mergeSubjectMaterials for ${subjectCode}:`, error);
    return manualMaterials;
  }
};


