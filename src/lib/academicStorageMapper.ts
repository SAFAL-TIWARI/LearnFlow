import { supabase } from './supabaseClient';
import { FileResource, SubjectMaterials } from '../data/academicData';
import {
  STORAGE_BUCKET,
  STORAGE_FOLDERS,
  MATERIAL_TYPES,
  FILE_TYPE_MAP,
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
  // Extract file extension
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'other';
  const fileType = FILE_TYPE_MAP[fileExtension] || 'other';

  // Calculate file size in KB or MB
  const fileSizeInBytes = file.metadata?.size || 0;
  let fileSize = '0 KB';

  if (fileSizeInBytes > 0) {
    if (fileSizeInBytes > 1024 * 1024) {
      fileSize = `${(fileSizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    } else {
      fileSize = `${Math.ceil(fileSizeInBytes / 1024)} KB`;
    }
  }

  // Generate file path
  const filePath = `${STORAGE_FOLDERS.ACADEMIC}/${subjectCode}/${materialType}/${file.name}`;

  // Generate public URL
  const publicUrl = getPublicUrl(filePath);

  return {
    id: `storage_${subjectCode}_${materialType}_${file.name}`,
    name: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "), // Remove extension and replace underscores with spaces
    type: fileType,
    url: publicUrl,
    uploadDate: file.created_at || new Date().toISOString().split('T')[0],
    size: fileSize,
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
      .from(STORAGE_BUCKET)
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

/**
 * Uploads a file for a specific subject and material type to Supabase storage
 */
export const uploadSubjectMaterial = async (
  subjectCode: string,
  materialType: string,
  file: File
): Promise<FileResource | null> => {
  try {
    // Create a file path
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
    } catch (folderError) {
      // Ignore errors if folder already exists
    }

    // Upload the file
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error(`Error uploading ${materialType} for ${subjectCode}:`, error);
      return null;
    }

    // Get the file metadata
    const { data: fileData } = await supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    // Convert to FileResource
    return {
      id: `storage_${subjectCode}_${materialType}_${fileName}`,
      name: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
      type: FILE_TYPE_MAP[file.name.split('.').pop()?.toLowerCase() || 'other'] || 'other',
      url: fileData.publicUrl,
      uploadDate: new Date().toISOString().split('T')[0],
      size: file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.ceil(file.size / 1024)} KB`,
      downloadUrl: fileData.publicUrl
    };
  } catch (error) {
    console.error(`Error in uploadSubjectMaterial for ${subjectCode}/${materialType}:`, error);
    return null;
  }
};
