import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getSession, isAuthenticated } from '../lib/auth-fallback';
import { useSession } from 'next-auth/react';

interface UserData {
  id: string;
  name: string;
  email: string;
  year?: string;
  semester?: string;
  branch?: string;
  profile_picture?: string;
}

interface FileUpload {
  id: string;
  name: string;
  url: string;
  type: string;
  created_at: string;
  category: string;
}

const ProfilePage: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadSection, setUploadSection] = useState<string | null>(null);
  const [userFiles, setUserFiles] = useState<FileUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Try to use NextAuth session first
  const { data: nextAuthSession, status } = useSession();
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Check if we're using NextAuth or fallback
        let userEmail = '';
        
        if (status === 'authenticated' && nextAuthSession) {
          // Using NextAuth
          userEmail = nextAuthSession.user?.email || '';
        } else if (isAuthenticated()) {
          // Using fallback auth
          const fallbackSession = getSession();
          userEmail = fallbackSession?.user.email || '';
        } else {
          // Not authenticated
          setLoading(false);
          return;
        }
        
        // Fetch user data from Supabase
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', userEmail)
          .single();
          
        if (error) {
          console.error('Error fetching user data:', error);
          throw error;
        }
        
        setUserData(data);
        
        // Fetch user files
        const { data: filesData, error: filesError } = await supabase
          .from('user_files')
          .select('*')
          .eq('user_id', data.id);
          
        if (filesError) {
          console.error('Error fetching user files:', filesError);
          throw filesError;
        }
        
        setUserFiles(filesData || []);
      } catch (error) {
        console.error('Error in profile setup:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (status !== 'loading') {
      fetchUserData();
    }
  }, [nextAuthSession, status]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData(prev => prev ? { ...prev, [name]: value } : null);
  };
  
  const handleSaveProfile = async () => {
    if (!userData) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('users')
        .update({
          name: userData.name,
          year: userData.year,
          semester: userData.semester,
          branch: userData.branch,
        })
        .eq('id', userData.id);
        
      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !userData) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${userData.id}-profile-picture.${fileExt}`;
    
    try {
      setIsUploading(true);
      
      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100);
          },
        });
        
      if (error) {
        console.error('Error uploading profile picture:', error);
        throw error;
      }
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);
        
      // Update user profile with the new picture URL
      const { error: updateError } = await supabase
        .from('users')
        .update({
          profile_picture: urlData.publicUrl,
        })
        .eq('id', userData.id);
        
      if (updateError) {
        console.error('Error updating profile picture URL:', updateError);
        throw updateError;
      }
      
      // Update local state
      setUserData(prev => prev ? { ...prev, profile_picture: urlData.publicUrl } : null);
      alert('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error changing profile picture:', error);
      alert('Failed to update profile picture. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  const handleFileUpload = async (files: FileList | null, category: string) => {
    if (!files || !userData) return;
    
    try {
      setIsUploading(true);
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${userData.id}-${Date.now()}-${i}.${fileExt}`;
        
        // Upload the file to Supabase Storage
        const { data, error } = await supabase.storage
          .from('user-files')
          .upload(`${category}/${fileName}`, file, {
            cacheControl: '3600',
            upsert: true,
            onUploadProgress: (progress) => {
              setUploadProgress((progress.loaded / progress.total) * 100);
            },
          });
          
        if (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          continue;
        }
        
        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('user-files')
          .getPublicUrl(`${category}/${fileName}`);
          
        // Save file metadata to the database
        const { error: insertError } = await supabase
          .from('user_files')
          .insert({
            user_id: userData.id,
            name: file.name,
            url: urlData.publicUrl,
            type: file.type,
            category: category,
          });
          
        if (insertError) {
          console.error('Error saving file metadata:', insertError);
          continue;
        }
      }
      
      // Refresh the file list
      const { data: filesData, error: filesError } = await supabase
        .from('user_files')
        .select('*')
        .eq('user_id', userData.id);
        
      if (filesError) {
        console.error('Error fetching user files:', filesError);
      } else {
        setUserFiles(filesData || []);
      }
      
      alert('Files uploaded successfully!');
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload some files. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, category: string) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files, category);
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const files = e.target.files;
    handleFileUpload(files, category);
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-t-4 border-learnflow-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">You need to be signed in to view your profile.</p>
        <button
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-learnflow-500 text-white rounded-lg hover:bg-learnflow-600 transition-colors"
        >
          Go to Home
        </button>
      </div>
    );
  }
  
  const profilePicture = userData.profile_picture || 
    nextAuthSession?.user?.image || 
    'https://ui-avatars.com/api/?name=' + encodeURIComponent(userData.name || 'User');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Your Profile</h1>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                <img 
                  src={profilePicture} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 group-hover:border-learnflow-500 transition-all duration-300"
                />
                <div 
                  className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => document.getElementById('profile-picture-input')?.click()}
                >
                  <span className="text-white text-sm">Change Picture</span>
                </div>
                <input 
                  type="file" 
                  id="profile-picture-input" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                />
              </div>
              
              {isUploading && (
                <div className="mt-2 w-full">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-learnflow-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Profile Information Section */}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={userData.name || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-learnflow-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={userData.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Year
                  </label>
                  <select
                    name="year"
                    value={userData.year || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-learnflow-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Semester
                  </label>
                  <select
                    name="semester"
                    value={userData.semester || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-learnflow-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select Semester</option>
                    <option value="1">1st Semester</option>
                    <option value="2">2nd Semester</option>
                    <option value="3">3rd Semester</option>
                    <option value="4">4th Semester</option>
                    <option value="5">5th Semester</option>
                    <option value="6">6th Semester</option>
                    <option value="7">7th Semester</option>
                    <option value="8">8th Semester</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Branch
                  </label>
                  <select
                    name="branch"
                    value={userData.branch || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-learnflow-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select Branch</option>
                    <option value="CSE">Computer Science Engineering</option>
                    <option value="IT">Information Technology</option>
                    <option value="ECE">Electronics & Communication</option>
                    <option value="EE">Electrical Engineering</option>
                    <option value="ME">Mechanical Engineering</option>
                    <option value="CE">Civil Engineering</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="px-4 py-2 bg-learnflow-500 text-white rounded-md hover:bg-learnflow-600 focus:outline-none focus:ring-2 focus:ring-learnflow-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* File Upload Section */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Your Uploads</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {['Syllabus', 'Assignments', 'Practicals', 'Lab Work', 'PYQs', 'Notes'].map((category) => (
              <button
                key={category}
                onClick={() => setUploadSection(category)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  uploadSection === category 
                    ? 'bg-learnflow-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {uploadSection && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">{uploadSection} Files</h3>
              
              {/* Drag and Drop Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragging 
                    ? 'border-learnflow-500 bg-learnflow-50 dark:bg-gray-700' 
                    : 'border-gray-300 hover:border-learnflow-400 dark:border-gray-600 dark:hover:border-gray-500'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, uploadSection.toLowerCase())}
                onClick={triggerFileInput}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  onChange={(e) => handleFileInputChange(e, uploadSection.toLowerCase())}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-gray-600 dark:text-gray-400 mb-2">Drag and drop files here or click to upload</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Upload any file related to {uploadSection}</p>
              </div>
              
              {isUploading && (
                <div className="mt-4">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-4 dark:bg-gray-700">
                      <div className="bg-learnflow-500 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 w-10">{Math.round(uploadProgress)}%</span>
                  </div>
                </div>
              )}
              
              {/* File List */}
              <div className="mt-6">
                <h4 className="text-md font-medium mb-2 text-gray-700 dark:text-gray-300">Your {uploadSection} Files</h4>
                
                {userFiles.filter(file => file.category === uploadSection.toLowerCase()).length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm italic">No files uploaded yet</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userFiles
                      .filter(file => file.category === uploadSection.toLowerCase())
                      .map(file => (
                        <div key={file.id} className="border border-gray-200 dark:border-gray-700 rounded-md p-3 flex items-center">
                          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-md mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{file.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(file.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <a 
                            href={file.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-2 text-learnflow-500 hover:text-learnflow-600"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </a>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;