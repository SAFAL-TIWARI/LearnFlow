import React, { useState, useEffect } from 'react';
import { supabase, supabaseUrl } from '../lib/supabase';
import { branchSubjects, Subject } from '../data/academicData';
import BackButton from '../components/BackButton';
import SubjectFilesDisplay from '../components/SubjectFilesDisplay';
import FileViewerModal from '../components/FileViewerModal';
import '../styles/animations.css';
import { ProfilePageErrorFallback } from './ProfilePageWrapper';

interface UserProfilePageProps {
  userId: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  year?: string;
  semester?: string;
  branch?: string;
  is_public?: boolean;
}

interface FileUpload {
  id: string;
  name: string;
  url: string;
  type: string;
  created_at: string;
  category: string;
  subject_code?: string;
  subject_name?: string;
  is_public?: boolean;
  publicUrl?: string;
  description?: string;
  file_path?: string;
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ userId }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userFiles, setUserFiles] = useState<FileUpload[]>([]);
  const [uploadSection, setUploadSection] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownTimeouts, setDropdownTimeouts] = useState<Record<string, NodeJS.Timeout>>({});
  const [isMobile, setIsMobile] = useState(false);
  const [isFileViewerOpen, setIsFileViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileUpload | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        console.log('Fetching user profile with ID:', userId);

        // Fetch the user data for the specified user ID from profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching user data by ID:', error);
          setLoading(false);
          return;
        }

        if (data) {
          console.log('User found by ID:', data);

          // Check if the profile is public
          const isPublic = data.is_public === true;

          if (isPublic) {
            console.log('Profile data:', data);

            // Extract year from the profile data
            // If year is in format "Year X", extract the number
            let year = '';
            if (data.year) {
              if (data.year.includes('Year')) {
                const match = data.year.match(/Year\s*(\d+)/i);
                if (match && match[1]) {
                  year = match[1];
                } else {
                  year = data.year;
                }
              } else {
                year = data.year;
              }
            }

            // Use the semester value from the profile data if it exists
            // Otherwise, determine semester based on year as a fallback
            let semester = data.semester || '';

            // Only calculate semester from year if it's not already provided in the profile data
            if (!semester && year) {
              const yearNum = parseInt(year);
              if (!isNaN(yearNum)) {
                // For simplicity: Year 1 -> Semester 1, Year 2 -> Semester 3, etc.
                semester = ((yearNum - 1) * 2 + 1).toString();
              }
            }

            // Map profile data to userData format with all necessary fields
            setUserData({
              id: data.id,
              name: data.full_name || data.username || 'Unknown User',
              email: data.email || '',
              year: year,
              semester: semester,
              branch: data.branch || '',
              is_public: data.is_public
            });

            // Fetch files for this user
            await fetchUserFiles(userId);
          } else {
            console.log('Profile is not public');
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error in fetchUserData:', error);
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  // Get subjects for the selected branch - moved up to be available for fetchUserFiles
  const getSubjectsForUser = () => {
    let subjectsList: Subject[] = [];
    if (userData?.year && userData?.semester && userData?.branch) {
      const yearNum = parseInt(userData.year, 10);
      const semesterNum = parseInt(userData.semester, 10);
      // Convert branch to lowercase to match the keys in branchSubjects
      const branchId = userData.branch.toLowerCase();

      console.log('Getting subjects for:', {
        year: yearNum,
        semester: semesterNum,
        branch: userData.branch,
        branchId: branchId
      });

      if (!isNaN(yearNum) && !isNaN(semesterNum) &&
        branchSubjects[yearNum] &&
        branchSubjects[yearNum][semesterNum] &&
        branchSubjects[yearNum][semesterNum][branchId]) {
        // Access the subjects for this specific branch, year, and semester
        subjectsList = branchSubjects[yearNum][semesterNum][branchId];
        console.log('Found subjects:', subjectsList);
      } else {
        console.log('No subjects found for this combination. Available branches:',
          branchSubjects[yearNum] && branchSubjects[yearNum][semesterNum]
            ? Object.keys(branchSubjects[yearNum][semesterNum])
            : 'None');
      }
    }
    return subjectsList;
  };

  // Fetch user files
  const fetchUserFiles = async (userId: string) => {
    try {
      console.log('Fetching files for user ID:', userId);

      // First try to get files from user_files table
      const { data, error } = await supabase
        .from('user_files')
        .select('*')
        .eq('user_id', userId);
        // Removed .eq('is_public', true) to include all files

      if (error) {
        console.error('Error fetching user files:', error);
        return;
      }

      console.log('User files:', data);

      let allFiles = [];

      if (data && data.length > 0) {
        // Process the files to add public URLs and map material_type to category
        const processedFiles = data.map((file: any) => {
          // Create a public URL for the file
          let publicUrl = '';

          if (file.file_path) {
            // If we have a file_path, use it to construct the URL
            publicUrl = `${supabaseUrl}/storage/v1/object/public/${file.file_path}`;
          } else {
            // Otherwise, construct from bucket and filename
            const bucketName = 'user-files';
            const filePath = `${userId}/${file.name}`;
            publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
          }

          // Add academic information to the file if it's not already there
          if (!file.subject_code && userData) {
            // Try to infer subject code from filename or set to empty
            const subjectCode = file.name.match(/^([A-Z]{2,3}\s*\d{3})/) ?
              file.name.match(/^([A-Z]{2,3}\s*\d{3})/)[1] : '';

            return {
              ...file,
              publicUrl,
              year: file.year || userData.year,
              semester: file.semester || userData.semester,
              branch: file.branch || userData.branch,
              subject_code: file.subject_code || subjectCode,
              category: file.material_type || ''  // Map material_type to category
            };
          }

          return {
            ...file,
            publicUrl,
            category: file.material_type || ''  // Map material_type to category
          };
        });

        allFiles = [...processedFiles];
      }

      // Also try to get files from storage directly
      try {
        const bucketName = 'user-files';

        // First check the user's personal folder
        const { data: personalStorageData, error: personalStorageError } = await supabase.storage
          .from(bucketName)
          .list(userId);

        if (!personalStorageError && personalStorageData && personalStorageData.length > 0) {
          console.log('Files found in personal storage:', personalStorageData);

          // Convert storage files to our FileUpload format
          const personalStorageFiles = personalStorageData.map((file: any) => {
            const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${userId}/${file.name}`;

            // Try to infer subject code from filename or set to empty
            const subjectCode = file.name.match(/^([A-Z]{2,3}\s*\d{3})/) ?
              file.name.match(/^([A-Z]{2,3}\s*\d{3})/)[1] : '';

            return {
              id: file.id || Math.random().toString(36).substring(2),
              name: file.name,
              url: publicUrl,
              publicUrl: publicUrl,
              type: file.metadata?.mimetype || 'application/octet-stream',
              created_at: file.created_at || new Date().toISOString(),
              category: 'notes', // Default category
              file_path: `${bucketName}/${userId}/${file.name}`,
              is_public: true,
              // Add academic information if available
              year: userData?.year,
              semester: userData?.semester,
              branch: userData?.branch,
              subject_code: subjectCode
            };
          });

          allFiles = [...allFiles, ...personalStorageFiles];
        }

        // Now check for organized files in material type folders
        const materialTypes = ['syllabus', 'assignments', 'practicals', 'lab-reports', 'notes'];

        // Get subjects for this user
        const subjects = getSubjectsForUser();

        // If we have subjects, check for each subject
        if (subjects.length > 0) {
          for (const subject of subjects) {
            for (const materialType of materialTypes) {
              try {
                const storagePath = `${materialType}/${subject.code}`;

                const { data: subjectStorageData, error: subjectStorageError } = await supabase.storage
                  .from(bucketName)
                  .list(storagePath);

                if (!subjectStorageError && subjectStorageData && subjectStorageData.length > 0) {
                  console.log(`Files found for ${subject.code} in ${materialType}:`, subjectStorageData);

                  const subjectFiles = subjectStorageData.map((file: any) => {
                    const filePath = `${storagePath}/${file.name}`;
                    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;

                    return {
                      id: file.id || Math.random().toString(36).substring(2),
                      name: file.name,
                      url: publicUrl,
                      publicUrl: publicUrl,
                      type: file.metadata?.mimetype || 'application/octet-stream',
                      created_at: file.created_at || new Date().toISOString(),
                      category: materialType,
                      file_path: `${bucketName}/${filePath}`,
                      is_public: true,
                      subject_code: subject.code,
                      subject_name: subject.name
                    };
                  });

                  allFiles = [...allFiles, ...subjectFiles];
                }
              } catch (err) {
                console.error(`Error checking ${materialType} for ${subject.code}:`, err);
              }
            }
          }
        }

        // Remove duplicates based on file path
        const uniqueFiles = allFiles.filter((file, index, self) =>
          index === self.findIndex(f => f.file_path === file.file_path)
        );

        if (uniqueFiles.length > 0) {
          setUserFiles(uniqueFiles);
        } else {
          console.log('No files found for user');
          setUserFiles([]);
        }
      } catch (storageError) {
        console.error('Error accessing storage:', storageError);

        // If we have files from the database but storage access failed, still show those
        if (allFiles.length > 0) {
          setUserFiles(allFiles);
        } else {
          setUserFiles([]);
        }
      }
    } catch (error) {
      console.error('Error in fetchUserFiles:', error);
    }
  };

  // Handle dropdown menu
  const handleDropdownHover = (dropdownId: string) => {
    // Clear any existing timeout for this dropdown
    if (dropdownTimeouts[dropdownId]) {
      clearTimeout(dropdownTimeouts[dropdownId]);
    }

    setActiveDropdown(dropdownId);
  };

  const handleDropdownLeave = (dropdownId: string) => {
    // Set a timeout to close the dropdown
    const timeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 300);

    // Store the timeout ID
    setDropdownTimeouts({
      ...dropdownTimeouts,
      [dropdownId]: timeout
    });
  };
  
  // Handle file selection for viewing
  const handleFileSelect = (file: FileUpload) => {
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

  // Effect to log when selected subject changes
  useEffect(() => {
    if (selectedSubject) {
      console.log('Selected subject changed:', selectedSubject);
    } else {
      console.log('Subject selection cleared');
    }
  }, [selectedSubject]);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // Check on initial load
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      // Clear all dropdown timeouts
      Object.values(dropdownTimeouts).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, [dropdownTimeouts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-learnflow-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="flex items-center mb-6">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3V8m0 0V6m0 2h2m-2 0H9" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white ml-4">Profile Not Available</h1>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              This profile is either private or does not exist. You can only view public profiles.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => window.location.href = '/search'}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-md"
                aria-label="Go back to search page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Search
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get subjects for the selected branch
  const subjects = getSubjectsForUser();
  console.log('Subjects for rendering:', subjects);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 animate-fadeIn">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <BackButton
              fallbackPath="/search"
              className="mr-4"
              ariaLabel="Go back to search page"
              title="Go back to search"
            />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              {userData?.name}'s Profile
            </h1>
          </div>
        </div>

        {/* User Information Section - Two Column Layout */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8 transition-all duration-300 hover:shadow-xl">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-learnflow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Student Information
            </h2>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Left Column - Profile Photo and Basic Info */}
              <div className="w-full md:w-1/3">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                  <div className="p-6 flex flex-col items-center">
                    <div className="mb-4">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-learnflow-200 dark:border-learnflow-800">
                        <div className="w-full h-full bg-learnflow-500 dark:bg-learnflow-700 flex items-center justify-center text-white font-semibold text-2xl">
                          {userData.name ? (
                            // Get initials: first letter of first name and first letter of last name
                            userData.name.split(' ').map(part => part.charAt(0).toUpperCase()).slice(0, 2).join('')
                          ) : (
                            // Fallback to first letter if no name or no space in name
                            userData.email.charAt(0).toUpperCase()
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{userData.name}</h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">{userData.email}</p>

                      <div className="flex flex-col gap-y-2 mb-3">
                        <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium mr-1">Year:</span>
                          <span className={!userData.year ? 'text-gray-400 italic' : ''}>
                            {userData.year ? `${userData.year}` : 'Not specified'}
                          </span>
                        </div>
                        <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium mr-1">Semester:</span>
                          <span className={!userData.semester ? 'text-gray-400 italic' : ''}>
                            {userData.semester ? `${userData.semester}` : 'Not specified'}
                          </span>
                        </div>
                        <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium mr-1">Branch:</span>
                          <span className={!userData.branch ? 'text-gray-400 italic' : ''}>
                            {userData.branch ? (
                              userData.branch === 'CSE' ? 'Computer Science Engineering' :
                                userData.branch === 'BLOCKCHAIN' ? 'Blockchain Technology' :
                                  userData.branch === 'AIADS' ? 'Artificial Intelligence & Data Science' :
                                    userData.branch === 'AIAML' ? 'Artificial Intelligence & Machine Learning' :
                                      userData.branch === 'CSE-IOT' ? 'Internet of Things' :
                                        userData.branch === 'IT' ? 'Information Technology' :
                                          userData.branch === 'ECE' ? 'Electronics & Communication' :
                                            userData.branch === 'EE' ? 'Electrical Engineering' :
                                              userData.branch === 'EI' ? 'Electronics & Instrumentation' :
                                                userData.branch === 'ME' ? 'Mechanical Engineering' :
                                                  userData.branch === 'CE' ? 'Civil Engineering' :
                                                    userData.branch
                            ) : 'Not specified'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - User Information */}
              <div className="w-full md:w-2/3 mt-6 md:mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Name</label>
                    <p className="text-gray-800 dark:text-white">{userData.name}</p>
                  </div>

                  {/* <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
                    <p className="text-gray-800 dark:text-white">{userData.email || 'Not available'}</p>
                  </div> */}

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Year</label>
                    <p className="text-gray-800 dark:text-white">{userData.year ? `Year ${userData.year}` : 'Not specified'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Semester</label>
                    <p className="text-gray-800 dark:text-white">{userData.semester ? `Semester ${userData.semester}` : 'Not specified'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Branch</label>
                    <p className="text-gray-800 dark:text-white">
                      {userData.branch ? (
                        userData.branch === 'CSE' ? 'Computer Science Engineering' :
                          userData.branch === 'BLOCKCHAIN' ? 'Blockchain Technology' :
                            userData.branch === 'AI&DS' ? 'Artificial Intelligence & Data Science' :
                              userData.branch === 'AI&ML' ? 'Artificial Intelligence & Machine Learning' :
                                userData.branch === 'CSE-IOT' ? 'Internet of Things' :
                                  userData.branch === 'IT' ? 'Information Technology' :
                                    userData.branch === 'ECE' ? 'Electronics & Communication' :
                                      userData.branch === 'EE' ? 'Electrical Engineering' :
                                        userData.branch === 'ME' ? 'Mechanical Engineering' :
                                          userData.branch === 'CE' ? 'Civil Engineering' :
                                            userData.branch
                      ) : 'Not specified'}
                    </p>
                  </div>

                  {/* <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Profile Visibility</label>
                    <p className="text-gray-800 dark:text-white">
                      {userData.is_public ? 'Public' : 'Private'}
                    </p>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Files Section */}
        {userData?.year && userData?.semester && userData?.branch && (
          <SubjectFilesDisplay
            year={userData.year}
            semester={userData.semester}
            branch={userData.branch}
          />
        )}

        {/* User Uploads Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8 transition-all duration-300 hover:shadow-xl">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-learnflow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {userData?.name}'s Uploads
            </h2>

            {/* Upload Categories */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
              {['syllabus', 'assignments', 'practicals', 'lab-work', 'PYQs', 'notes'].map((category) => (
                <div
                  key={category}
                  className={`p-2 border-2 rounded-xl cursor-pointer transition-all duration-300 ${uploadSection === category
                    ? 'border-learnflow-500 bg-learnflow-50 dark:bg-learnflow-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-learnflow-300 dark:hover:border-learnflow-700'
                    }`}
                  onClick={() => setUploadSection(category)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium capitalize text-gray-800 dark:text-white">
                      {category.replace('-', ' ')}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 transition-transform duration-300 ${uploadSection === category ? 'text-learnflow-500 rotate-180' : 'text-gray-400'
                        }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            {/* Subject Selection */}
            {uploadSection && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Select Subject</label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-learnflow-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    value={selectedSubject ? JSON.stringify(selectedSubject) : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        const selected = JSON.parse(e.target.value);
                        console.log('Selected subject:', selected);
                        setSelectedSubject(selected);
                      } else {
                        console.log('Cleared subject selection');
                        setSelectedSubject(null);
                      }
                    }}
                  >
                    <option value="">All Subjects</option>
                    {subjects && subjects.length > 0 ? (
                      subjects.map((subject) => (
                        <option key={subject.code} value={JSON.stringify(subject)}>
                          {subject.code} - {subject.name}
                        </option>
                      ))
                    ) : (
                      <option disabled value="">No subjects available for this branch/year/semester</option>
                    )}
                  </select>
                </div>
              </div>
            )}

            {/* Files Display */}
            {uploadSection && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-learnflow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {userData?.name}'s {uploadSection} Files
                  {selectedSubject && (
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      ({selectedSubject.code})
                    </span>
                  )}
                </h3>

                {userFiles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-3 gap-4">
                    {userFiles
                      .filter(file => {
                        // Filter by category/section
                        const categoryMatch = file.category === uploadSection;

                        // Filter by subject if selected
                        let subjectMatch = true;
                        if (selectedSubject) {
                          // If a subject is selected, only show files for that subject
                          subjectMatch = file.subject_code &&
                            file.subject_code.trim().toUpperCase() === selectedSubject.code.trim().toUpperCase();
                        }

                        // Log for debugging
                        console.log(`File: ${file.name}, Category: ${file.category}, Subject: ${file.subject_code || 'none'}, Selected Subject: ${selectedSubject?.code || 'none'}, Matches: ${categoryMatch && subjectMatch}`);

                        return categoryMatch && subjectMatch;
                      })
                      .map((file) => (
                        <div
                          key={file.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300"
                        >
                          <div className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-learnflow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <div>
                                  {/* <h4 className="text-sm font-medium text-gray-800 dark:text-white truncate" title={file.name}>
                                    {file.name}
                                  </h4> */}
                                  <div className="flex flex-col text-xs">
                                    {/* <p className="text-gray-500 dark:text-gray-400">
                                      {new Date(file.created_at).toLocaleDateString()}
                                    </p> */}
                                    {file.subject_code && (
                                      <p className="text-learnflow-600 dark:text-learnflow-400">
                                        {file.subject_code}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="relative"
                                onMouseEnter={() => handleDropdownHover(`file-${file.id}`)}
                                onMouseLeave={() => handleDropdownLeave(`file-${file.id}`)}
                              >
                                <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                  </svg>
                                </button>
                                {activeDropdown === `file-${file.id}` && (
                                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                                    <a
                                      href={file.publicUrl || file.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-md"
                                    >
                                      View File
                                    </a>
                                    <a
                                      href={file.publicUrl || file.url}
                                      download={file.name}
                                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-md"
                                    >
                                      Download
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedSubject
                        ? `No ${uploadSection} files shared yet for ${selectedSubject.code} - ${selectedSubject.name}`
                        : `No ${uploadSection} files shared yet. Try selecting a specific subject.`}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;