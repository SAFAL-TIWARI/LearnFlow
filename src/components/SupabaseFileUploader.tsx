import React, { useState, useRef } from 'react';
import { useAcademic } from '../context/AcademicContext';
import { uploadSubjectMaterial } from '../lib/academicStorageMapper';
import { STORAGE_BUCKET, STORAGE_FOLDERS } from '../lib/supabaseStorage';
import { useAuth } from '../context/SupabaseAuthContext';

interface SupabaseFileUploaderProps {
  onUploadComplete?: () => void;
}

const SupabaseFileUploader: React.FC<SupabaseFileUploaderProps> = ({
  onUploadComplete
}) => {
  const { state } = useAcademic();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Only render if subject and material are selected
  if (!state.selectedSubject || !state.selectedMaterial) {
    return null;
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || !state.selectedSubject || !state.selectedMaterial) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const totalFiles = files.length;
      let completedFiles = 0;

      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];

        try {
          // Upload file to Supabase storage
          await uploadSubjectMaterial(
            state.selectedSubject,
            state.selectedMaterial,
            file
          );

          // Update progress
          completedFiles++;
          setUploadProgress((completedFiles / totalFiles) * 100);
        } catch (fileError) {
          console.error(`Error uploading file ${file.name}:`, fileError);
        }
      }

      // Notify parent component that upload is complete
      if (onUploadComplete) {
        onUploadComplete();
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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    handleFileUpload(files);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Check if user is authenticated
  const isAuthenticated = !!user;

  if (!isAuthenticated) {
    return (
      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-600 dark:text-gray-400 text-center">
          Please sign in to upload files.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
        Upload {state.selectedMaterial} for {state.selectedSubject}
      </h3>

      {/* Drag and Drop Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-learnflow-500 bg-learnflow-50 dark:bg-gray-700'
            : 'border-gray-300 hover:border-learnflow-400 dark:border-gray-600 dark:hover:border-gray-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={handleFileInputChange}
        />
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-gray-600 dark:text-gray-400 mb-2">Drag and drop files here or click to upload</p>
        <p className="text-sm text-gray-500 dark:text-gray-500">Upload any file related to {state.selectedMaterial}</p>
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
    </div>
  );
};

export default SupabaseFileUploader;
