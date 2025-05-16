
import React, { useState, useEffect, useRef } from 'react';
import { useAcademic } from '../context/AcademicContext';
import { resourceFiles, subjectMaterials, FileResource } from '../data/academicData';
import { getFileIcon, DownloadIcon } from './Icons';
import { useSession } from '../lib/auth-fallback';
import { downloadGoogleDriveFile } from '../utils/downloadUtils';
import { isAuthenticated as isFallbackAuthenticated } from '../lib/auth-fallback';
import { AnimatedList } from './magicui/animated-list';
import { useIframeTouchScroll } from '../hooks/use-iframe-touch-scroll';
import '../styles/iframe-touch-fix.css';

// Fallback authentication state if NextAuth fails
const useAuthFallback = () => {
  const [localAuth, setLocalAuth] = useState<{isAuthenticated: boolean}>({
    isAuthenticated: false
  });

  // Check if user is authenticated in localStorage
  useEffect(() => {
    const storedAuth = localStorage.getItem('user-auth');
    if (storedAuth) {
      try {
        setLocalAuth(JSON.parse(storedAuth));
      } catch (e) {
        console.error('Failed to parse stored auth', e);
      }
    }
  }, []);

  const login = () => {
    setLocalAuth({ isAuthenticated: true });
    localStorage.setItem('user-auth', JSON.stringify({ isAuthenticated: true }));
  };

  const logout = () => {
    setLocalAuth({ isAuthenticated: false });
    localStorage.setItem('user-auth', JSON.stringify({ isAuthenticated: false }));
  };

  return { ...localAuth, login, logout };
};

const ResourceFiles: React.FC = () => {
  const { state } = useAcademic();
  const { data: session, status } = useSession();
  const fallbackAuth = useAuthFallback();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const { containerRef, overlayRef } = useIframeTouchScroll();
  
  // Use either NextAuth session or fallback authentication
  const isAuthenticated = (() => {
    // First try NextAuth
    if (status === 'authenticated') return !!session;
    
    // If NextAuth status is error, use fallback
    if (status === 'unauthenticated') {
      // Try our fallback auth first
      if (isFallbackAuthenticated()) {
        return true;
      }
      
      // Then try the local auth
      return fallbackAuth.isAuthenticated;
    }
    
    // Check both fallback mechanisms as last resort
    try {
      return isFallbackAuthenticated() || fallbackAuth.isAuthenticated;
    } catch (e) {
      return false;
    }
  })();
  
  // Only render if material type is selected
  if (!state.selectedMaterial) {
    return null;
  }
  
  // Get subject-specific materials if available, otherwise use generic materials
  const getSubjectMaterials = (): FileResource[] => {
    // If subject is selected, try to get subject-specific materials
    if (state.selectedSubject && subjectMaterials[state.selectedSubject]) {
      const materialType = state.selectedMaterial as keyof typeof subjectMaterials[string];
      return subjectMaterials[state.selectedSubject][materialType] || [];
    }
    
    // Fallback to generic materials if subject-specific ones aren't available
    return resourceFiles[state.selectedMaterial] || [];
  };
  
  const files = getSubjectMaterials();
  
  if (files.length === 0) {
    return (
      <div className="mb-8 animate-slide-in">
        <p className="text-gray-600 dark:text-gray-400">
          {state.selectedSubject ? (
            <>🚧 Material for {state.selectedSubject} will be updated soon!</>
          ) : (
            <>No files available for this selection.</>
          )}
        </p>
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
        <AnimatedList delay={300} className="w-full">
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
                    onClick={() => setSelectedFile(file.id)}
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
                              <span class="font-medium">Please sign up to download the material</span>
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
      
      {/* File viewer */}
      {selectedFile && (
        <div className="mt-8 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              {files.find(f => f.id === selectedFile)?.name}
            </h3>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="document-preview-wrapper bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div ref={containerRef} className="iframe-container">
              {/* Touch overlay to handle scrolling */}
              <div 
                ref={overlayRef}
                className="touch-scroll-overlay"
              ></div>
              <iframe
                src={files.find(f => f.id === selectedFile)?.url}
                className="w-full h-[600px]"
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
          <div className="mt-4 flex justify-end">
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
                              <span class="font-medium">Please sign up to download the material and then refresh the page</span>
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
                    className={`flex items-center px-4 py-2 ${isAuthenticated ? 'bg-learnflow-600 hover:bg-learnflow-700' : 'bg-gray-400 hover:bg-gray-500'} text-white rounded-lg transition-colors`}
                  >
                    <DownloadIcon className="w-5 h-5 mr-2" /> 
                    {isAuthenticated ? 'Download File' : 'Sign up to Download'}
                  </button>
                );
              }
              return null;
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceFiles;
