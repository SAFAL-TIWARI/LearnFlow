import React, { useState, useEffect } from 'react';
import { useAcademic } from '../context/AcademicContext';
import { resourceFiles, subjectMaterials, FileResource } from '../data/academicData';
import { getFileIcon, DownloadIcon } from './Icons';
import { downloadGoogleDriveFile } from '../utils/downloadUtils';
import { AnimatedList } from './magicui/animated-list';
import { useIframeTouchScroll } from '../hooks/use-iframe-touch-scroll';
import '../styles/iframe-touch-fix.css';
import { fetchSubjectMaterialFiles } from '../lib/academicStorageMapper';
import SupabaseFileUploader from './SupabaseFileUploader';
import { useUnifiedAuth } from '../hooks/useUnifiedAuth';

const ResourceFiles: React.FC = () => {
  const { state } = useAcademic();
  const { isAuthenticated, user, loading: authLoading, authMethod } = useUnifiedAuth();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const { containerRef, overlayRef } = useIframeTouchScroll();
  const [storageFiles, setStorageFiles] = useState<FileResource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Handle opening the file viewer
  const openFileViewer = (fileId: string) => {
    setSelectedFile(fileId);
    setIsViewerOpen(true);
    // Allow background scrolling - no need to prevent body scroll
  };

  // Handle closing the file viewer
  const closeFileViewer = () => {
    setIsViewerOpen(false);
    setSelectedFile(null);
    // Background scrolling remains enabled
  };

  // Cleanup effect - no longer needed since we allow background scrolling
  useEffect(() => {
    return () => {
      // No cleanup needed for scroll management
    };
  }, []);

  // Handle keyboard events for closing viewer
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isViewerOpen) {
        closeFileViewer();
      }
    };

    if (isViewerOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isViewerOpen]);

  // Fetch files from Supabase storage when subject or material changes
  useEffect(() => {
    const fetchStorageFiles = async () => {
      if (!state.selectedSubject || !state.selectedMaterial) {
        setStorageFiles([]);
        return;
      }

      try {
        // Convert 'Syllabus' to 'syllabus' for storage path
        const materialType = state.selectedMaterial === 'Syllabus'
          ? 'syllabus'
          : state.selectedMaterial;

        const files = await fetchSubjectMaterialFiles(
          state.selectedSubject,
          materialType
        );

        setStorageFiles(files);
      } catch (error) {
        console.error('Error fetching files from storage:', error);
        setStorageFiles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStorageFiles();
  }, [state.selectedSubject, state.selectedMaterial, refreshTrigger]);

  // Add a visual debug indicator for authentication state
  const renderAuthDebug = () => {
    // if (process.env.NODE_ENV === 'development') {
    //   return (
    //     <div className="fixed bottom-4 left-4 bg-black text-white p-2 rounded text-xs z-50 max-w-xs">
    //       {/* <div>Auth Status: {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}</div> */}
    //       {/* <div>User: {user?.email || user?.name || 'none'}</div> */}
    //       {/* <div>Method: {authMethod}</div> */}
    //       {/* <div>Loading: {authLoading ? 'yes' : 'no'}</div> */}
    //     </div>
    //   );
    // }
    return null;
  };

  // Only render if material type is selected
  if (!state.selectedMaterial) {
    return null;
  }

  // Get subject-specific materials if available, otherwise use generic materials
  const getSubjectMaterials = (): FileResource[] => {
    let manualFiles: FileResource[] = [];

    // If subject is selected, try to get subject-specific materials
    if (state.selectedSubject && subjectMaterials[state.selectedSubject]) {
      const materialType = state.selectedMaterial as keyof typeof subjectMaterials[string];
      manualFiles = subjectMaterials[state.selectedSubject][materialType] || [];
    } else {
      // Fallback to generic materials if subject-specific ones aren't available
      manualFiles = resourceFiles[state.selectedMaterial] || [];
    }

    // Merge manual files with storage files
    // Use a Map to deduplicate by ID
    const filesMap = new Map<string, FileResource>();

    // Add manual files first
    manualFiles.forEach(file => {
      filesMap.set(file.id, file);
    });

    // Add storage files, potentially overwriting manual files with the same ID
    storageFiles.forEach(file => {
      filesMap.set(file.id, file);
    });

    // Convert back to array
    return Array.from(filesMap.values());
  };

  const files = getSubjectMaterials();

  // Function to refresh files from storage
  const refreshFiles = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (files.length === 0 && !isLoading) {
    return (
      <div className="mb-8 animate-slide-in">
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {state.selectedSubject ? (
            <>🚧 Material for {state.selectedSubject} will be updated soon!</>
          ) : (
            <>No files available for this selection.</>
          )}
        </p>

        {/* Add file uploader component */}
        {state.selectedSubject && state.selectedMaterial && (
          <SupabaseFileUploader onUploadComplete={refreshFiles} />
        )}
        {renderAuthDebug()}
      </div>
    );
  }

  // Show loading indicator
  if (isLoading) {
    return (
      <div className="mb-8 animate-slide-in">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-learnflow-500"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading materials...</span>
        </div>
        {renderAuthDebug()}
      </div>
    );
  }

  return (
    <div className="mb-8 animate-slide-in">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          {state.selectedSubject ? (
            <>Available {state.selectedMaterial} for {state.selectedSubject}</>
          ) : (
            <>Available Resources</>
          )}
        </h3>

        {/* Add file uploader component */}
        {state.selectedSubject && state.selectedMaterial && isAuthenticated && (
          <SupabaseFileUploader onUploadComplete={refreshFiles} />
        )}

        <AnimatedList delay={300} className="w-full mt-6">
          {files.map((file) => {
            return (
              <div key={file.id} className="file-item w-full">
                <div className="flex flex-grow items-center min-w-0 space-x-3">
                  <div className="flex-shrink-0">
                    {getFileIcon(file.type)}
                  </div>
                  <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{file.name}</span>
                </div>
                <div className="flex flex-shrink-0 items-center space-x-4 md:space-x-6 ml-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">{file.size}</span>
                  <button
                    onClick={() => openFileViewer(file.id)}
                    className="text-learnflow-600 dark:text-learnflow-400 hover:text-learnflow-700 dark:hover:text-learnflow-300 transition-colors"
                  >
                    View
                  </button>
                  <button
                    className={`text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors ${!isAuthenticated ? 'opacity-50' : ''}`}
                    title={!isAuthenticated ? "Sign up to download" : "Download file"}
                    onClick={() => {
                      if (!isAuthenticated) {
                        // Show a more user-friendly error message
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'fixed top-0 left-0 w-full bg-red-500 text-white p-4 text-center z-50 animate-slide-down';
                        errorDiv.innerHTML = `
                          <div class="flex justify-between items-center max-w-4xl mx-auto">
                            <div class="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <span class="font-medium">Please
                                <button class="underline hover:text-yellow-200 transition-colors mx-1" onclick="window.open('/login?mode=signup', '_blank', 'width=500,height=600'); this.closest('.fixed').remove();">sign up</button>
                                or
                                <button class="underline hover:text-yellow-200 transition-colors mx-1" onclick="window.open('/login?mode=signin', '_blank', 'width=500,height=600'); this.closest('.fixed').remove();">sign in</button>
                                to download the material
                              </span>
                            </div>
                            <button class="text-white" onclick="this.parentNode.parentNode.remove()">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        `;
                        document.body.appendChild(errorDiv);

                        // Remove the error message after 5 seconds
                        setTimeout(() => {
                          errorDiv.classList.add('animate-slide-up');
                          setTimeout(() => {
                            errorDiv.remove();
                          }, 500);
                        }, 5000);
                        return;
                      }

                      // Use our download utility
                      downloadGoogleDriveFile(file.url, file.name);
                    }}
                    disabled={!isAuthenticated}
                  >
                    <DownloadIcon />
                  </button>
                </div>
              </div>
            );
          })}
        </AnimatedList>
      </div>

      {/* Full-screen File Viewer */}
      {isViewerOpen && selectedFile && (
        <>
          {/* Overlay - allows background scrolling */}
          <div
            className="fixed inset-0 bg-black/50 z-[9998] animate-fade-in pointer-events-none"
            style={{ pointerEvents: 'none' }}
          ></div>

          {/* Clickable overlay for closing */}
          <div
            className="fixed inset-0 z-[9998] cursor-pointer"
            onClick={closeFileViewer}
            style={{ background: 'transparent' }}
          ></div>

          {/* Viewer Container */}
          <div className="fixed top-100 left-5 right-5 bottom-0 z-[9999] flex items-center justify-center p-2 sm:p-4 pointer-events-none">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full h-[90vh] sm:h-[95vh] max-w-7xl flex flex-col animate-viewer-open overflow-hidden file-viewer-modal pointer-events-auto">
              {/* Header */}
              <div className="flex justify-between items-center p-3 sm:p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 truncate pr-4">
                  {files.find(f => f.id === selectedFile)?.name}
                </h3>
                <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                  {/* Download Button */}
                  {(() => {
                    const file = files.find(f => f.id === selectedFile);
                    if (file) {
                      return (
                        <button
                          onClick={() => {
                            if (!isAuthenticated) {
                              // Show a more user-friendly error message
                              const errorDiv = document.createElement('div');
                              errorDiv.className = 'fixed top-0 left-0 w-full bg-red-500 text-white p-4 text-center z-50 animate-slide-down';
                              errorDiv.innerHTML = `
                                <div class="flex justify-between items-center max-w-4xl mx-auto">
                                  <div class="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <span class="font-medium">Please
                                      <button class="underline hover:text-yellow-200 transition-colors mx-1" onclick="window.open('/login?mode=signup', '_blank', 'width=500,height=600'); this.closest('.fixed').remove();">sign up</button>
                                      or
                                      <button class="underline hover:text-yellow-200 transition-colors mx-1" onclick="window.open('/login?mode=signin', '_blank', 'width=500,height=600'); this.closest('.fixed').remove();">sign in</button>
                                      to download the material
                                    </span>
                                  </div>
                                  <button class="text-white" onclick="this.parentNode.parentNode.remove()">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              `;
                              document.body.appendChild(errorDiv);

                              // Remove the error message after 5 seconds
                              setTimeout(() => {
                                errorDiv.classList.add('animate-slide-up');
                                setTimeout(() => {
                                  errorDiv.remove();
                                }, 500);
                              }, 5000);
                              return;
                            }

                            // Use our download utility
                            downloadGoogleDriveFile(file.url, file.name);
                          }}
                          className={`flex items-center px-2 sm:px-4 py-2 ${isAuthenticated ? 'bg-learnflow-600 hover:bg-learnflow-700' : 'bg-gray-400 hover:bg-gray-500'} text-white rounded-lg transition-colors text-sm sm:text-base`}
                          title={!isAuthenticated ? "Sign up to download" : "Download file"}
                        >
                          <DownloadIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">{isAuthenticated ? 'Download' : 'Sign up'}</span>
                          <span className="sm:hidden">{isAuthenticated ? 'DL' : 'Sign'}</span>
                        </button>
                      );
                    }
                    return null;
                  })()}

                  {/* Close Button */}
                  <button
                    onClick={closeFileViewer}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-1 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Close viewer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden min-h-0">
                <div ref={containerRef} className="iframe-container h-full w-full">
                  {/* Touch overlay to handle scrolling */}
                  <div
                    ref={overlayRef}
                    className="touch-scroll-overlay"
                  ></div>
                  <iframe
                    src={files.find(f => f.id === selectedFile)?.url}
                    className="w-full h-full border-0 rounded-b-xl"
                    title={files.find(f => f.id === selectedFile)?.name}
                    allow="autoplay"
                    allowFullScreen
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    onLoad={(e) => {
                      try {
                        // Try to access iframe content (may fail due to same-origin policy)
                        const iframe = e.target as HTMLIFrameElement;
                        if (iframe.contentWindow && iframe.contentDocument) {
                          // Add CSS to make content scrollable
                          const style = document.createElement('style');
                          style.textContent = `
                            html, body {
                              -webkit-overflow-scrolling: touch !important;
                              overflow: auto !important;
                              touch-action: pan-y pinch-zoom !important;
                              height: 100% !important;
                            }
                          `;
                          iframe.contentDocument.head.appendChild(style);
                        }
                      } catch (error) {
                        // Silently fail - this is expected due to cross-origin restrictions
                        console.log("Could not modify iframe content due to same-origin policy");
                      }
                    }}
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {renderAuthDebug()}
    </div>
  );
};

export default ResourceFiles;
