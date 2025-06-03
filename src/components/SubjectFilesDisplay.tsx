import React, { useState, useEffect } from 'react';
import { supabase, supabaseUrl } from '../lib/supabase';
import { branchSubjects, Subject } from '../data/academicData';
import FileViewerModal from './FileViewerModal';

interface SubjectFilesDisplayProps {
  year?: string;
  semester?: string;
  branch?: string;
}

interface SubjectFile {
  id: string;
  name: string;
  url: string;
  publicUrl: string;
  created_at: string;
  type?: string;
  category?: string;
  subject_code?: string;
  user_id?: string;
}

const SubjectFilesDisplay: React.FC<SubjectFilesDisplayProps> = ({ year, semester, branch }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectFiles, setSubjectFiles] = useState<Record<string, SubjectFile[]>>({});
  const [isLoadingFiles, setIsLoadingFiles] = useState<Record<string, boolean>>({});
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [isFileViewerOpen, setIsFileViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SubjectFile | null>(null);

  // Get subjects based on year, semester, and branch
  useEffect(() => {
    if (year && semester && branch) {
      const yearNum = parseInt(year, 10);
      const semesterNum = parseInt(semester, 10);

      if (!isNaN(yearNum) && !isNaN(semesterNum) &&
        branchSubjects[yearNum] &&
        branchSubjects[yearNum][semesterNum] &&
        branchSubjects[yearNum][semesterNum][branch]) {
        // Access the subjects for this specific branch, year, and semester
        setSubjects(branchSubjects[yearNum][semesterNum][branch]);
      } else {
        setSubjects([]);
      }
    } else {
      setSubjects([]);
    }
  }, [year, semester, branch]);

  // Fetch files for a specific subject from user-files bucket
  const fetchSubjectFiles = async (subjectCode: string) => {
    if (isLoadingFiles[subjectCode] || subjectFiles[subjectCode]) {
      return; // Already loading or loaded
    }

    console.log(`Fetching files for subject: ${subjectCode}`);
    setIsLoadingFiles(prev => ({ ...prev, [subjectCode]: true }));

    try {
      // Query user_files table for files with matching subject_code
      const { data, error } = await supabase
        .from('user_files')
        .select('*')
        .eq('subject_code', subjectCode)
        .eq('is_public', true);

      if (error) {
        console.error(`Error fetching files for subject ${subjectCode}:`, error);
        return;
      }
      
      console.log(`Found ${data?.length || 0} files for subject ${subjectCode} in database`);
      

      // Also try to fetch files directly from storage for each material type
      const materialTypes = ['Syllabus', 'assignments', 'practicals', 'labwork', 'pyq'];
      let storageFiles: any[] = [];

      console.log(`Checking storage for subject ${subjectCode} in material types:`, materialTypes);

      // Convert 'Syllabus' to lowercase for storage path
      for (const materialType of materialTypes) {
        const storagePath = materialType === 'Syllabus' ? 'syllabus' : materialType;
        
        try {
          const path = `${storagePath}/${subjectCode}`;
          console.log(`Checking storage path: ${path}`);
          
          // Check if files exist in the organized path structure
          const { data: storageData, error: storageError } = await supabase.storage
            .from('user-files')
            .list(path);

          if (!storageError && storageData && storageData.length > 0) {
            // Process storage files
            const processedStorageFiles = storageData.map((file: any) => {
              const filePath = `${storagePath}/${subjectCode}/${file.name}`;
              const publicUrl = `${supabaseUrl}/storage/v1/object/public/user-files/${filePath}`;
              
              return {
                id: file.id || `storage_${Math.random().toString(36).substring(2)}`,
                name: file.name,
                file_name: file.name,
                file_path: filePath,
                subject_code: subjectCode,
                material_type: materialType,
                created_at: file.created_at || new Date().toISOString(),
                is_public: true,
                publicUrl: publicUrl
              };
            });
            
            storageFiles = [...storageFiles, ...processedStorageFiles];
          }
        } catch (storageError) {
          console.error(`Error fetching storage files for ${subjectCode}/${storagePath}:`, storageError);
        }
      }

      // Combine database files and storage files
      let allFiles = [];
      
      if (data && data.length > 0) {
        // Process database files to add public URLs
        const processedDbFiles = data.map((file: any) => {
          let publicUrl = '';

          if (file.file_path) {
            // If we have a file_path, use it to construct the URL
            publicUrl = `${supabaseUrl}/storage/v1/object/public/user-files/${file.file_path}`;
          } else {
            // Otherwise, construct from bucket and filename
            const bucketName = 'user-files';
            const filePath = `${file.user_id}/${file.name}`;
            publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
          }

          return {
            ...file,
            publicUrl
          };
        });
        
        allFiles = [...processedDbFiles];
      }
      
      // Add storage files
      allFiles = [...allFiles, ...storageFiles];
      
      // Remove duplicates (if any) based on file path
      const uniqueFiles = allFiles.filter((file, index, self) => 
        index === self.findIndex(f => f.file_path === file.file_path)
      );

      console.log(`Found ${uniqueFiles.length} unique files for subject ${subjectCode}`);
      
      // Always set the files array, even if empty
      setSubjectFiles(prev => ({ ...prev, [subjectCode]: uniqueFiles }));
    } catch (error) {
      console.error(`Error in fetchSubjectFiles for ${subjectCode}:`, error);
    } finally {
      setIsLoadingFiles(prev => ({ ...prev, [subjectCode]: false }));
    }
  };

  // Toggle expanded subject
  const toggleSubject = (subjectCode: string) => {
    if (expandedSubject === subjectCode) {
      setExpandedSubject(null);
    } else {
      setExpandedSubject(subjectCode);
      fetchSubjectFiles(subjectCode);
    }
  };
  
  // Handle file selection for viewing
  const handleFileSelect = (file: SubjectFile) => {
    setSelectedFile(file);
    setIsFileViewerOpen(true);
  };
  
  // Close the file viewer modal
  const handleCloseFileViewer = () => {
    setIsFileViewerOpen(false);
    // We keep the selected file in state for a moment to avoid UI flicker during the closing animation
    setTimeout(() => {
      setSelectedFile(null);
    }, 300);
  };

  if (subjects.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8 transition-all duration-300 hover:shadow-xl">
      {/* File Viewer Modal */}
      <FileViewerModal 
        isOpen={isFileViewerOpen}
        onClose={handleCloseFileViewer}
        file={selectedFile}
      />
      
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-learnflow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Subject Resources
        </h2>

        <div className="space-y-4">
          {subjects.map((subject) => (
            <div key={subject.code} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div 
                className="p-4 bg-gray-50 dark:bg-gray-700 cursor-pointer flex justify-between items-center"
                onClick={() => toggleSubject(subject.code)}
              >
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">{subject.code}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{subject.name}</p>
                </div>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${expandedSubject === subject.code ? 'transform rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {expandedSubject === subject.code && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  {isLoadingFiles[subject.code] ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-learnflow-500"></div>
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading files...</span>
                    </div>
                  ) : (
                    <>
                      {subjectFiles[subject.code] && subjectFiles[subject.code].length > 0 ? (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Available files:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {subjectFiles[subject.code].map((file) => (
                              <div 
                                key={file.id} 
                                className="flex items-start p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                                onClick={() => handleFileSelect(file)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-learnflow-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-learnflow-600 dark:text-learnflow-400 hover:underline block truncate">
                                    {file.name}
                                  </div>
                                  <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    <span>Uploaded: {new Date(file.created_at).toLocaleDateString()}</span>
                                    {file.category && (
                                      <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-600 rounded-full">
                                        {file.category}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <a 
                                    href={file.publicUrl} 
                                    download={file.name}
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 inline-flex"
                                    title="Download file"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-400">No files available for this subject.</p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubjectFilesDisplay;