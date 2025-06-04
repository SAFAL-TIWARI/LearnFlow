import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/SupabaseAuthContext';
import PageFadeSection from '../components/PageFadeSection';
import SEOStructuredData from '../components/SEOStructuredData';
import { ThemeProvider } from '../hooks/useTheme';
import { getUserProfile, getUserFiles, downloadFile, UserFile, UserProfile } from '../utils/supabaseClient';
import { supabase } from '../utils/supabaseClient';

const UserFiles: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [files, setFiles] = useState<UserFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setError('User ID is required');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch user profile
        const profile = await getUserProfile(userId);
        if (!profile) {
          setError('User not found');
          setIsLoading(false);
          return;
        }
        setUserProfile(profile);

        // Fetch files if user is logged in
        if (user) {
          const userFiles = await getUserFiles(userId, user.id);
          setFiles(userFiles);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, user]);

  const handleDownload = async (file: UserFile) => {
    if (!user) {
      // Redirect to login or show login modal
      alert('Please log in to download files');
      return;
    }

    try {
      setDownloadingFileId(file.id);
      
      // Validate file path
      if (!file.file_path || file.file_path.trim() === '') {
        throw new Error('Invalid file path: File path is empty');
      }
      
      console.log('Attempting to download file:', file.file_name, 'from path:', file.file_path);
      console.log('File details:', file);
      
      // Get file from storage, passing the bucket_id if available
      const fileData = await downloadFile(file.file_path, (file as any).bucket_id);
      if (!fileData) {
        throw new Error('Failed to download file');
      }
      
      // Create download link
      const url = URL.createObjectURL(fileData);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('File download completed successfully');
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Failed to download file: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setDownloadingFileId(null);
    }
  };

  // Format file size
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown size';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // Get file icon based on type
  const getFileIcon = (fileType?: string): JSX.Element => {
    if (!fileType) return <DocumentIcon />;
    
    if (fileType.includes('image')) {
      return <ImageIcon />;
    } else if (fileType.includes('pdf')) {
      return <PDFIcon />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <DocIcon />;
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return <SpreadsheetIcon />;
    } else if (fileType.includes('video')) {
      return <VideoIcon />;
    } else if (fileType.includes('audio')) {
      return <AudioIcon />;
    } else if (fileType.includes('zip') || fileType.includes('compressed')) {
      return <ZipIcon />;
    } else {
      return <DocumentIcon />;
    }
  };

  return (
    <ThemeProvider>
      <SEOStructuredData page="user-files" />
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-grow container mx-auto px-4 py-8">
          <PageFadeSection animationType="fade-in" threshold={0.05}>
            <div className="max-w-4xl mx-auto">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-learnflow-600"></div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-xl text-red-600 dark:text-red-400">{error}</p>
                  <Link 
                    to="/search" 
                    className="mt-4 inline-block bg-learnflow-600 hover:bg-learnflow-700 text-white px-4 py-2 rounded-lg transition-colors duration-300"
                  >
                    Back to Search
                  </Link>
                </div>
              ) : userProfile ? (
                <>
                  {/* User Profile Header */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 mb-8">
                    <div className="p-6 flex flex-col md:flex-row gap-6">
                      <div className="flex-shrink-0">
                        <img 
                          src={userProfile.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.full_name)}&background=random`} 
                          alt={userProfile.full_name} 
                          className="w-24 h-24 rounded-full object-cover border-2 border-learnflow-200 dark:border-learnflow-800"
                        />
                      </div>
                      <div className="flex-grow">
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">{userProfile.full_name}</h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">@{userProfile.username}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 mb-3">
                          {userProfile.branch && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium mr-1">Branch:</span> {userProfile.branch}
                            </div>
                          )}
                          {userProfile.year && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium mr-1">Year:</span> {userProfile.year}
                            </div>
                          )}
                          {userProfile.college && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium mr-1">College:</span> {userProfile.college}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Link 
                          to={`/profile/${userProfile.id}`}
                          className="bg-learnflow-600 hover:bg-learnflow-700 text-white px-4 py-2 rounded-lg transition-colors duration-300"
                        >
                          View Full Profile
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Files Section */}
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 font-bodoni">
                    {userProfile.full_name}'s Files
                  </h2>

                  {!user ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                      <p className="text-yellow-800 dark:text-yellow-200">
                        Please <Link to="/login" className="font-medium underline">log in</Link> to view and download files.
                      </p>
                    </div>
                  ) : files.length === 0 ? (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 text-center">
                      <p className="text-gray-600 dark:text-gray-400 mb-2">No files available</p>
                      <p className="text-gray-500 dark:text-gray-500 text-sm">
                        {userId === user.id 
                          ? "You haven't uploaded any files yet." 
                          : "This user hasn't shared any files with you."}
                      </p>
                      {userId === user.id && (
                        <Link 
                          to="/profile" 
                          className="mt-4 inline-block bg-learnflow-600 hover:bg-learnflow-700 text-white px-4 py-2 rounded-lg transition-colors duration-300"
                        >
                          Upload Files
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {files.map((file) => (
                        <div 
                          key={file.id}
                          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center hover:shadow-md transition-shadow duration-300"
                        >
                          <div className="mr-4 text-gray-500 dark:text-gray-400">
                            {getFileIcon(file.file_type)}
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-medium text-gray-900 dark:text-white">{file.file_name}</h3>
                            {file.description && (
                              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{file.description}</p>
                            )}
                            <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-500">
                              <span>{formatFileSize(file.file_size)}</span>
                              <span className="mx-2">•</span>
                              <span>{new Date(file.created_at).toLocaleDateString()}</span>
                              {file.is_public && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full">Public</span>
                                </>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownload(file)}
                            disabled={downloadingFileId === file.id}
                            className="ml-4 bg-learnflow-600 hover:bg-learnflow-700 text-white px-3 py-1.5 rounded-lg transition-colors duration-300 flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {downloadingFileId === file.id ? (
                              <>
                                <span className="mr-2">Downloading</span>
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                              </>
                            ) : (
                              <>
                                <DownloadIcon className="mr-1.5" />
                                Download
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </PageFadeSection>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
};

// File type icons
const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const PDFIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    <text x="8.5" y="16" fontSize="6" fontWeight="bold" fill="currentColor">PDF</text>
  </svg>
);

const DocIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    <text x="8" y="16" fontSize="5" fontWeight="bold" fill="currentColor">DOC</text>
  </svg>
);

const SpreadsheetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    <text x="8" y="16" fontSize="5" fontWeight="bold" fill="currentColor">XLS</text>
  </svg>
);

const VideoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const AudioIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
  </svg>
);

const ZipIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
  </svg>
);

const DownloadIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

export default UserFiles;

// SEO Structured Data Props Interface
interface SEOStructuredDataProps {
  page?: 'home' | 'tools' | 'resources' | 'help' | 'user-files';
}