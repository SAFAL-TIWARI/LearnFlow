import React, { useState, useRef, useEffect } from 'react';
import { uploadFile } from '../utils/supabaseClient';
import { useAuth } from '../context/SupabaseAuthContext';
import { branchSubjects, Subject, materialTypes } from '../data/academicData';
import { supabase } from '../lib/supabase';

interface FileUploaderProps {
  onFileUploaded?: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUploaded }) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedMaterialType, setSelectedMaterialType] = useState<string>('');
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Fetch user profile and available subjects when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.error('Error fetching user profile:', error);
            return;
          }
          
          setUserProfile(data);
          
          // If user has year, semester, and branch, filter subjects accordingly
          if (data.year && data.semester && data.branch) {
            const yearNum = parseInt(data.year);
            const semesterNum = parseInt(data.semester);
            const branchId = data.branch.toLowerCase();
            
            if (!isNaN(yearNum) && !isNaN(semesterNum) &&
              branchSubjects[yearNum] &&
              branchSubjects[yearNum][semesterNum] &&
              branchSubjects[yearNum][semesterNum][branchId]) {
              // Get subjects for this specific branch, year, and semester
              const userSubjects = branchSubjects[yearNum][semesterNum][branchId];
              setSubjects(userSubjects);
            }
          }
        } catch (err) {
          console.error('Error in fetchUserProfile:', err);
        }
      }
    };
    
    // Combine all subjects from all branches, years, and semesters
    const getAllSubjects = () => {
      const allSubjects: Subject[] = [];
      
      // Iterate through all years, semesters, and branches to collect subjects
      Object.keys(branchSubjects).forEach(year => {
        Object.keys(branchSubjects[parseInt(year)]).forEach(semester => {
          Object.keys(branchSubjects[parseInt(year)][parseInt(semester)]).forEach(branch => {
            branchSubjects[parseInt(year)][parseInt(semester)][branch].forEach(subject => {
              // Check if subject already exists in the array
              if (!allSubjects.some(s => s.code === subject.code)) {
                allSubjects.push(subject);
              }
            });
          });
        });
      });
      
      setAvailableSubjects(allSubjects);
    };
    
    fetchUserProfile();
    getAllSubjects();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to upload files');
      return;
    }
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    if (!selectedSubject) {
      setError('Please select a subject');
      return;
    }
    
    if (!selectedMaterialType) {
      setError('Please select a material type');
      return;
    }
    
    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);
      
      // Create a progress handler
      const handleProgress = (progress: number) => {
        setUploadProgress(progress);
      };
      
      const result = await uploadFile(
        file, 
        user.id, 
        description, 
        isPublic, 
        selectedSubject,
        selectedMaterialType,
        handleProgress
      );
      
      if (!result) {
        throw new Error('Failed to upload file');
      }
      
      // Reset form
      setFile(null);
      setDescription('');
      setIsPublic(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Show success message
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
      
      // Notify parent component
      if (onFileUploaded) {
        onFileUploaded();
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Filter subjects based on user profile if available
  const getFilteredSubjects = () => {
    if (userProfile && userProfile.year && userProfile.semester && userProfile.branch && subjects.length > 0) {
      return subjects;
    }
    return availableSubjects;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Upload File</h2>
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg">
          File uploaded successfully!
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Select File
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            disabled={isUploading}
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>
        
        {/* Material Type Selection */}
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Section (Material Type)
          </label>
          <select
            value={selectedMaterialType}
            onChange={(e) => setSelectedMaterialType(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            disabled={isUploading}
            required
          >
            <option value="">Select Section</option>
            {materialTypes.map((material) => (
              <option key={material.id} value={material.id}>
                {material.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Subject Selection */}
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            disabled={isUploading}
            required
          >
            <option value="">Select Subject</option>
            {getFilteredSubjects().map((subject) => (
              <option key={subject.code} value={subject.code}>
                {subject.code} - {subject.name}
              </option>
            ))}
          </select>
          {userProfile && userProfile.year && userProfile.semester && userProfile.branch && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Showing subjects for {userProfile.branch}, Year {userProfile.year}, Semester {userProfile.semester}
            </p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            rows={3}
            placeholder="Add a description for your file..."
            disabled={isUploading}
          />
        </div>
        
        <div className="mb-6">
          <label className="flex items-center text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="mr-2 h-4 w-4 text-learnflow-600 focus:ring-learnflow-500 border-gray-300 rounded"
              disabled={isUploading}
            />
            Make this file public (visible to all users)
          </label>
        </div>
        
        {isUploading && uploadProgress > 0 && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-learnflow-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
              {uploadProgress.toFixed(0)}% uploaded
            </p>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isUploading || !file || !selectedSubject || !selectedMaterialType}
          className="w-full bg-learnflow-600 hover:bg-learnflow-700 text-white py-2 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Uploading...
            </>
          ) : (
            'Upload File'
          )}
        </button>
      </form>
    </div>
  );
};

export default FileUploader;