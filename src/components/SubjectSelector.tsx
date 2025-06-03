
import React, { useState, useEffect } from 'react';
import { useAcademic } from '../context/AcademicContext';
import { branchSubjects, subjectsByYearAndSemester, branches, Subject } from '../data/academicData';
import { useIsMobile } from '../hooks/use-mobile';
import { supabase, supabaseUrl } from '../lib/supabase';

interface SubjectFile {
  id: string;
  name: string;
  url: string;
  publicUrl: string;
  created_at: string;
  type?: string;
  category?: string;
  subject_code?: string;
}

const SubjectSelector: React.FC = () => {
  const { state, setSubject } = useAcademic();
  const isMobile = useIsMobile();
  const [hoveredSubject, setHoveredSubject] = useState<string | null>(null);
  const [subjectFiles, setSubjectFiles] = useState<Record<string, SubjectFile[]>>({});
  const [isLoadingFiles, setIsLoadingFiles] = useState<Record<string, boolean>>({});

  // Only render if year, semester, and branch are selected
  if (state.selectedYear === null || state.selectedSemester === null || state.selectedBranch === null) {
    return null;
  }

  // Get branch-specific subjects if available
  const getBranchSubjects = (): Subject[] => {
    const year = state.selectedYear;
    const semester = state.selectedSemester;
    const branchId = state.selectedBranch;

    // Check if we have branch-specific subjects for this combination
    if (
      branchSubjects[year] &&
      branchSubjects[year][semester] &&
      branchSubjects[year][semester][branchId]
    ) {
      return branchSubjects[year][semester][branchId];
    }

    // Fallback to legacy subjects if branch-specific ones aren't available
    return subjectsByYearAndSemester[year][semester] || [];
  };

  // Get the selected branch name for display
  const getBranchName = (): string => {
    const branch = branches.find(b => b.id === state.selectedBranch);
    return branch ? branch.name : state.selectedBranch || '';
  };

  // Fetch files for a specific subject from user-files bucket
  const fetchSubjectFiles = async (subjectCode: string) => {
    if (isLoadingFiles[subjectCode] || subjectFiles[subjectCode]) {
      return; // Already loading or loaded
    }

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

      if (data && data.length > 0) {
        // Process files to add public URLs
        const processedFiles = data.map((file: any) => {
          let publicUrl = '';

          if (file.file_path) {
            // If we have a file_path, use it to construct the URL
            publicUrl = `${supabaseUrl}/storage/v1/object/public/${file.file_path}`;
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

        setSubjectFiles(prev => ({ ...prev, [subjectCode]: processedFiles }));
      } else {
        // No files found in database, set empty array
        setSubjectFiles(prev => ({ ...prev, [subjectCode]: [] }));
      }
    } catch (error) {
      console.error(`Error in fetchSubjectFiles for ${subjectCode}:`, error);
    } finally {
      setIsLoadingFiles(prev => ({ ...prev, [subjectCode]: false }));
    }
  };

  // Handle mouse enter on subject button
  const handleSubjectHover = (subjectCode: string) => {
    setHoveredSubject(subjectCode);
    fetchSubjectFiles(subjectCode);
  };

  // Handle mouse leave on subject button
  const handleSubjectLeave = () => {
    setHoveredSubject(null);
  };

  const subjects = getBranchSubjects();

  if (subjects.length === 0) {
    return (
      <div className="mb-8 animate-slide-in">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Select Subject</h2>
        <p className="text-gray-600 dark:text-gray-400">
          ⚠️ No subjects found for Year {state.selectedYear}, Semester {state.selectedSemester}, {getBranchName()} branch.
        </p>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Please select a different branch or check back later as we continue to update our curriculum data.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8 animate-slide-in">
      <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Select Subject</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Showing subjects for <span className="font-semibold">{getBranchName()}</span> branch
      </p>
      <div className={`${isMobile ? 'grid grid-cols-2 sm:grid-cols-3 gap-2' : 'flex flex-wrap gap-2'}`}>
        {subjects.map((subject) => (
          <div key={subject.code} className="relative">
            <button
              onClick={() => setSubject(subject.code)}
              onMouseEnter={() => handleSubjectHover(subject.code)}
              onMouseLeave={handleSubjectLeave}
              className={`btn-subject ${
                state.selectedSubject === subject.code ? 'btn-subject-active' : 'btn-subject-inactive'
              } font-ogg ${isMobile ? 'w-full text-center' : ''}`}
            >
              {subject.code}
            </button>
            
            {/* Hover Popup with Files */}
            {hoveredSubject === subject.code && (
              <div className="absolute z-10 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 p-3">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">{subject.name}</h4>
                
                {isLoadingFiles[subject.code] ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-learnflow-500"></div>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading files...</span>
                  </div>
                ) : (
                  <>
                    {subjectFiles[subject.code] && subjectFiles[subject.code].length > 0 ? (
                      <div className="max-h-48 overflow-y-auto">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Available files:</p>
                        <ul className="space-y-1">
                          {subjectFiles[subject.code].map((file) => (
                            <li key={file.id} className="text-sm">
                              <a 
                                href={file.publicUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-learnflow-600 dark:text-learnflow-400 hover:underline flex items-center"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {file.name}
                              </a>
                            </li>
                          ))}
                        </ul>
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
      <div className="mt-4">
        {state.selectedSubject && (
          <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 py-2 px-3 rounded inline-block">
            <strong>{subjects.find(s => s.code === state.selectedSubject)?.name}</strong>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectSelector;
